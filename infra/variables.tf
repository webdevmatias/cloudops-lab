variable "regiao" {
  description = "Região AWS onde os recursos são criados."
  type        = string
  default     = "us-east-1"
}

variable "projeto" {
  description = "Nome do projeto, usado como prefixo nos nomes e nas tags dos recursos."
  type        = string
  default     = "cloudops-lab"
}
