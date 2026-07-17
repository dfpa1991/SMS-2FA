#!/bin/bash

# Send a text message to a phone number for 2FA verification
# Usage: ./send-text.sh <phone_number> <message>
# Example: ./send-text.sh 1234567890 "Hello, how are you?"

# Configuration
SERVER_URL="http://192.168.100.50:8000/send-2fa"
PHONE_NUMBER="+573014743785"

# If no arguments are passed use the default phone number and generate a random 6 digit code
if [ -z "$1" ]; then
  PHONE=$PHONE_NUMBER
  # CODE=$(shuf -i 100000-999999 -n 1) # Generate a random 6 digit code on linux
  CODE=$(jot -r 1 100000 999999) # Generate a random 6 digit code on macos
  echo "No arguments provided. Using default phone number and generating a random 6 digit code: $CODE"
else
  # If arguments are passed use the first as the phone number and the second as the code
  PHONE=$1
  CODE=$2

  # Validation: if phone is passed but code is missing
  if [ -z "$CODE" ]; then
    echo "Error: Missing verification code"
    echo "Usage: ./send-text.sh <phone_number> <code>"
    echo "Example: ./send-text.sh +573014743585 123456"
    exit 1
  fi
fi

echo "Sending 2FA verification code to $PHONE: $CODE"

# Execute the API request
curl -X POST "$SERVER_URL" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"code\":\"$CODE\"}"

# Check the response status
if [ $? -eq 0 ]; then
  echo ""
  echo "2FA verification code sent successfully"
else
  echo "Failed to send 2FA verification code"
  exit 1
fi