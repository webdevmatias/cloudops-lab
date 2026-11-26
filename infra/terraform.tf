terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # TODO(Brenno): decidir se o state fica local ou em bucket S3 + lock.
  # backend "s3" {}
}