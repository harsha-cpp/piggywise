#!/bin/bash

# Script to switch between local and production environment configurations

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Define the project directory - change this to your project path
PROJECT_DIR="/Users/sriharsha/Desktop/piggywise-main"

# Function to show usage
usage() {
  echo "Usage: $0 [local|production]"
  echo ""
  echo "Options:"
  echo "  local       Switch to local PostgreSQL database configuration"
  echo "  production  Switch to Neon production database configuration"
  echo ""
  exit 1
}

# Check if an argument is provided
if [ "$#" -ne 1 ]; then
  usage
fi

# Switch based on the argument
case "$1" in
  local)
    echo "Switching to local database configuration..."
    cp "${SCRIPT_DIR}/.env.local" "${PROJECT_DIR}/.env"
    echo "Done! Your application is now configured to use the local PostgreSQL database."
    ;;
    
  production)
    # Check if .env.production exists
    if [ ! -f "${SCRIPT_DIR}/.env.production" ]; then
      echo "Error: Production environment file not found!"
      echo "Please create ${SCRIPT_DIR}/.env.production first by filling in the template."
      exit 1
    fi
    
    echo "Switching to production Neon database configuration..."
    cp "${SCRIPT_DIR}/.env.production" "${PROJECT_DIR}/.env"
    echo "Done! Your application is now configured to use the Neon production database."
    ;;
    
  *)
    usage
    ;;
esac

echo ""
echo "Remember to restart your application for the changes to take effect." 