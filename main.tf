# S3 static website bucket

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

# S3 bucket
resource "aws_s3_bucket" "mywebsite" {
  bucket = var.bucket_name  
  tags          = var.tags
  force_destroy = true
}

# Website Configuration
resource "aws_s3_bucket_website_configuration" "mywebsite" {
  bucket = aws_s3_bucket.mywebsite.id
  index_document {
    suffix = "index.html"
  }
  error_document {
    key = "error.html"
  }
}

# Bucket versioning 
resource "aws_s3_bucket_versioning" "mywebsite" {
  bucket = aws_s3_bucket.mywebsite.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Ownership controls
resource "aws_s3_bucket_ownership_controls" "mywebsite" {
  bucket = aws_s3_bucket.mywebsite.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

# Public access blocks
resource "aws_s3_bucket_public_access_block" "mywebsite" {
  bucket = aws_s3_bucket.mywebsite.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# Resource-6: aws_s3_bucket_acl
resource "aws_s3_bucket_acl" "mywebsite" {
  depends_on = [
    aws_s3_bucket_ownership_controls.mywebsite,
    aws_s3_bucket_public_access_block.mywebsite
  ]
  bucket = aws_s3_bucket.mywebsite.id
  acl    = "public-read"
}


# Resource-7: aws_s3_bucket_policy
resource "aws_s3_bucket_policy" "mywebsite" {
  bucket = aws_s3_bucket.mywebsite.id

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
      {
          "Sid": "PublicReadGetObject",
          "Effect": "Allow",
          "Principal": "*",
          "Action": [
              "s3:GetObject"
          ],
          "Resource": [
              "arn:aws:s3:::${var.bucket_name}/*"
          ]
      }
  ]
}  
EOF
}