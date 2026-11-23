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

# ---------- Backend ----------

resource "aws_instance" "backend" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t3.micro"
  subnet_id              = aws_subnet.publica.id
  vpc_security_group_ids = [aws_security_group.backend.id]
  iam_instance_profile   = "LabInstanceProfile"
  user_data              = file("${path.module}/scripts/instalar-docker.sh")

  tags = {
    Name = "${var.projeto}-backend"
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
  user_data              = file("${path.module}/scripts/instalar-docker.sh")

  tags = {
    Name = "${var.projeto}-banco"
  }
}
