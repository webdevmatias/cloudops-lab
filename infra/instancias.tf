# ---------- Frontend ----------

resource "aws_instance" "frontend" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t3.micro"
  subnet_id              = aws_subnet.publica.id
  vpc_security_group_ids = [aws_security_group.frontend.id]
  iam_instance_profile   = "LabInstanceProfile"
  user_data              = file("${path.module}/scripts/instalar-docker.sh")

  tags = {
    Name = "${var.projeto}-frontend"
  }
}

# IP fixo, para o endereço do site não mudar quando a instância reiniciar
resource "aws_eip" "frontend" {
  domain   = "vpc"
  instance = aws_instance.frontend.id

  tags = {
    Name = "${var.projeto}-eip-frontend"
  }
}

# ---------- Backend ----------

resource "aws_instance" "backend" {
  ami                    = data.aws_ami.ubuntu.id
  # t3.small para acomodar o backend e a stack de observabilidade
  # (Prometheus, Grafana, Loki e Promtail) na mesma instancia.
  instance_type          = "t3.small"
  subnet_id              = aws_subnet.publica.id
  vpc_security_group_ids = [aws_security_group.backend.id]
  iam_instance_profile   = "LabInstanceProfile"
  user_data              = file("${path.module}/scripts/instalar-docker.sh")

  tags = {
    Name = "${var.projeto}-backend"
  }
}

# IP fixo, porque o frontend chama a API por este endereço (NEXT_PUBLIC_API_URL)
resource "aws_eip" "backend" {
  domain   = "vpc"
  instance = aws_instance.backend.id

  tags = {
    Name = "${var.projeto}-eip-backend"
  }
}

# ---------- Banco de dados ----------

# Fica na subnet privada e só sai para a internet pelo NAT
resource "aws_instance" "banco" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t3.micro"
  subnet_id              = aws_subnet.privada.id
  vpc_security_group_ids = [aws_security_group.banco.id]
  iam_instance_profile   = "LabInstanceProfile"

  # Prepara o disco de dados e instala o Docker
  user_data = templatefile("${path.module}/scripts/preparar-banco.sh", {
    volume_id       = aws_ebs_volume.dados_banco.id
    instalar_docker = file("${path.module}/scripts/instalar-docker.sh")
  })

  # Os dados ficam no volume separado, então é possível recriar a instância
  # e garante que um script alterado rode de novo
  user_data_replace_on_change = true

  tags = {
    Name = "${var.projeto}-banco"
  }
}

# Disco separado para os dados do PostgreSQL, que sobrevive se a instância for recriada
resource "aws_ebs_volume" "dados_banco" {
  availability_zone = aws_subnet.privada.availability_zone
  size              = 10
  type              = "gp3"
  encrypted         = true

  tags = {
    Name = "${var.projeto}-dados-banco"
  }
}

resource "aws_volume_attachment" "dados_banco" {
  device_name = "/dev/sdf"
  volume_id   = aws_ebs_volume.dados_banco.id
  instance_id = aws_instance.banco.id

  # Desliga a instância antes de desplugar o disco, para não corromper os dados
  stop_instance_before_detaching = true
}
