terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Configure the AWS Provider
provider "aws" {
  region = "us-east-1"
  access_key = "AWS_ACCESS_KEY"
  secret_key = "AWS_SECRET_KEY"
}

# Upload index.html
resource "aws_s3_object" "index" {
  bucket = "aryan-website-test"
  key    = "index.html"
  source = "index.html"
  acl    = "public-read"
}

# Upload error.html
resource "aws_s3_object" "error" {
  bucket = "aryan-website-test"
  key    = "error.html"
  source = "error.html"
  acl    = "public-read"
}
