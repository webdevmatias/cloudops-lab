# ---------- Provider ----------

provider "aws" {
  region = var.regiao

  default_tags {
    tags = {
      Projeto       = var.projeto
      GerenciadoPor = "terraform"
    }
  }
}

# ---------- Imagem ----------

# Imagem do Ubuntu que as EC2 usarão
data "aws_ami" "ubuntu" {
  most_recent = true

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  owners = ["099720109477"] # Canonical
}

# ---------- VPC ----------

resource "aws_vpc" "principal" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true

  tags = {
    Name = "${var.projeto}-vpc"
  }
}

# ---------- Subnets ----------

# Frontend, backend e NAT ficam aqui
resource "aws_subnet" "publica" {
  vpc_id                  = aws_vpc.principal.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.projeto}-subnet-publica"
  }
}

# Só o PostgreSQL, fora do alcance da internet
resource "aws_subnet" "privada" {
  vpc_id            = aws_vpc.principal.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "us-east-1a"

  tags = {
    Name = "${var.projeto}-subnet-privada"
  }
}

# ---------- Internet Gateway ----------

resource "aws_internet_gateway" "principal" {
  vpc_id = aws_vpc.principal.id

  tags = {
    Name = "${var.projeto}-igw"
  }
}

# ---------- Rotas da subnet pública ----------

# Tudo que não é da VPC sai pelo Internet Gateway
resource "aws_route_table" "publica" {
  vpc_id = aws_vpc.principal.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.principal.id
  }

  tags = {
    Name = "${var.projeto}-rt-publica"
  }
}

resource "aws_route_table_association" "publica" {
  subnet_id      = aws_subnet.publica.id
  route_table_id = aws_route_table.publica.id
}

# ---------- NAT Gateway ----------

resource "aws_eip" "nat" {
  domain = "vpc"

  tags = {
    Name = "${var.projeto}-eip-nat"
  }
}

resource "aws_nat_gateway" "principal" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.publica.id

  tags = {
    Name = "${var.projeto}-nat"
  }

  depends_on = [aws_internet_gateway.principal]
}

# ---------- Rotas da subnet privada ----------

# A subnet privada sai para a internet pelo NAT, sem receber conexões de fora
resource "aws_route_table" "privada" {
  vpc_id = aws_vpc.principal.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.principal.id
  }

  tags = {
    Name = "${var.projeto}-rt-privada"
  }
}

resource "aws_route_table_association" "privada" {
  subnet_id      = aws_subnet.privada.id
  route_table_id = aws_route_table.privada.id
}
