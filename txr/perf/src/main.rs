use chrono::Utc;
use deflate::deflate_bytes;
use futures::{stream, StreamExt};
use reqwest::{
    header::{HeaderMap, HeaderValue},
    Client,
};
use std::{
    error::Error,
    fs,
    io::{stdout, Write},
};
use tokio;
use uuid::Uuid;

const TOKEN: &str = include_str!("../../token.jwt");
const URL: &str = "https://google.com";
const URL: &str = "https://txr-input.retailsvc.com/api/v1/transactions";
const TENANT_ID: &str = "CIR7nQwtS0rA6t0S6ejdtest";
const TOTAL_TRANSACTIONS: usize = 1000;
const PARALLEL_REQUESTS: usize = 10;

#[tokio::main]
async fn main() {
    println!("sending {TOTAL_TRANSACTIONS} transactions using {PARALLEL_REQUESTS} threads");

    let data = fs::read_to_string("../transaction.xml").unwrap();

    let client = Client::new();

    let date_start = Utc::now();

    let bodies = stream::iter(0..TOTAL_TRANSACTIONS)
        .map(|_| {
            let client = client.clone();
            let data = data.clone();
            tokio::spawn(async move {
                let (body, headers) = create_transaction(&data).unwrap();
                let res = client.post(URL).body(body).headers(headers).send().await?;

                if res.status() != 202 {
                    panic!("Unexpected status: {}", res.status());
                }

                res.bytes().await
            })
        })
        .buffer_unordered(PARALLEL_REQUESTS);

    bodies
        .for_each(|b| async {
            match b {
                Ok(Ok(_)) => {
                    print!(".");
                    stdout().flush().unwrap();
                }
                Ok(Err(e)) => eprintln!("Got a reqwest::Error: {}", e),
                Err(e) => eprintln!("Got an error: {}", e),
            }
        })
        .await;

    let date_end = Utc::now();

    println!();
    println!("start: {date_start}");
    println!("end: {date_end}");
    println!("duration: {}", date_end - date_start)
}

fn create_transaction(data: &String) -> Result<(Vec<u8>, HeaderMap), Box<dyn Error>> {
    let business_unit_id = uuid_str();
    let transaction_id = uuid_str();

    let mut headers = HeaderMap::new();
    headers.insert("ignore-domain-check", HeaderValue::from_static("true"));
    headers.insert("authorization", format!("Bearer {}", TOKEN.trim()).parse()?);

    headers.insert("tenant-id", HeaderValue::from_static(TENANT_ID));
    headers.insert("country-code", HeaderValue::from_static("NO"));
    headers.insert("content-type", HeaderValue::from_static("application/zip"));
    headers.insert("business-unit-id", business_unit_id.parse()?);
    headers.insert("transaction-id", transaction_id.parse()?);
    headers.insert("previous-transaction-id", uuid_str().parse()?);
    headers.insert("correlation-id", uuid_str().parse()?);
    headers.insert("transaction-timestamp", Utc::now().to_rfc3339().parse()?);

    let tx_data = data
        .replace("[[[BUSINESS_UNIT_ID]]]", &business_unit_id)
        .replace("[[[TRANSACTION_ID]]]", &transaction_id);

    let tx_data_compressed = deflate_bytes(tx_data.as_bytes());

    Ok((tx_data_compressed, headers))
}

fn uuid_str() -> String {
    format!("{}", Uuid::new_v4())
}
