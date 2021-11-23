export interface CloudEvent {
  id: string;

  source: string;

  type: string;

  specversion: string;

  datacontenttype: string;

  time: string;

  data: string;

  dataencoding: string;
}