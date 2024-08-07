
variable "bucket_name" {
  description = "AWS bucket name"
  type        = string
}

variable "tags" {
  description = "Bucket tags"
  type        = map(string)
  default     = {}
}
