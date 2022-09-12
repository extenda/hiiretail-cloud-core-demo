DIR="transactions"
find ./${DIR} -maxdepth 1 -type f -iname "*.xml" | xargs -I '{}' xmllint --schema schema.xsd '{}' --noout 2> results.txt
