@echo off
REM Script to connect to AWS EC2 instance
REM Usage: connect.bat <EC2_PUBLIC_IP>

if "%1"=="" (
    echo Usage: connect.bat ^<EC2_PUBLIC_IP^>
    echo Example: connect.bat 12.34.56.78
    exit /b 1
)

echo Connecting to AWS EC2 instance at %1...
ssh -i "..\ecommerce-key.pem" ubuntu@%1
