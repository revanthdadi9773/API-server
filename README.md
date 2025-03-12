# API Server Deployment with GitHub Actions and EC2

## Overview
This repository contains the API server that is deployed to an **EC2 instance** using **GitHub Actions**. The deployment process includes copying the latest code to the server, installing dependencies, and managing the application using **PM2**.

## Deployment Workflow
The deployment is automated using **GitHub Actions**, which follows these steps:

1. **Trigger:** Deployment starts on every push to the `main` branch.
2. **Checkout Code:** GitHub Actions pulls the latest code.
3. **Copy Files to EC2:** The code is securely copied to the EC2 instance using `scp`.
4. **Install Dependencies:** Runs `npm install` to install required packages.
5. **Start or Restart API:** Uses `pm2` to manage the API process.
6. **Save PM2 Process:** Ensures the process remains running after reboots.

## Prerequisites

### 1. Setup an EC2 Instance
- Create an AWS EC2 instance (Ubuntu recommended).
- Allow inbound traffic on **port 22 (SSH)** and **port 3000 (API)**.
- Connect to the instance using SSH:
  ```sh
  ssh -i your-key.pem ubuntu@your-ec2-ip
  ```
- Install Node.js and PM2:
  ```sh
  sudo apt update
  sudo apt install -y nodejs npm
  npm install -g pm2
  ```

### 2. Setup SSH Keys for GitHub Actions
- Generate an SSH key pair on your local machine:
  ```sh
  ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
  ```
- Copy the public key to the EC2 instance:
  ```sh
  ssh-copy-id -i ~/.ssh/id_rsa.pub ubuntu@your-ec2-ip
  ```
- Add the private key (`id_rsa`) as a **GitHub Actions Secret** in your repo (`SSH_PRIVATE_KEY`).

## GitHub Actions Workflow

Create a `.github/workflows/deploy.yml` file in your repo with the following content:

```yaml
name: Deploy to EC2

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Deploy via SSH
        uses: appleboy/ssh-action@v0.1.6
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ubuntu
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            echo "Deploying API to EC2..."
            cd /home/ubuntu
            echo "Copying files to EC2..."
            scp -o StrictHostKeyChecking=no -i ~/.ssh/id_rsa -r ./api/* ubuntu@${{ secrets.EC2_HOST }}:/home/ubuntu/api/
            echo "Navigating to API directory..."
            cd /home/ubuntu/api
            npm install
            echo "Starting API with PM2..."
            if pm2 list | grep -q 'api'; then
              pm2 restart api
            else
              pm2 start npm --name "api" -- start
            fi
            pm2 save
            echo "Deployment complete!"
```

## How to Verify Deployment
1. **Check Running Processes on EC2:**
   ```sh
   pm2 list
   ```
   Ensure `api` is listed and running.

2. **Check API Logs:**
   ```sh
   pm2 logs api
   ```

3. **Access the API in Browser or Postman:**
   ```sh
   curl http://your-ec2-ip:3000/
   ```
   If everything is working, you should see the expected response.

## Troubleshooting
- **Permission denied (publickey)** → Ensure SSH keys are correctly set up.
- **EC2 not responding** → Check security group rules for allowed inbound traffic.
- **PM2 process not found** → Ensure `pm2 start` was executed and `pm2 save` was run.

## Conclusion
This setup ensures smooth deployment of your API server from GitHub to AWS EC2, automating the process via GitHub Actions. 🚀
