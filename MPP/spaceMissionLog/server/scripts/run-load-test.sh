#!/bin/bash

# Check if Apache Bench is installed
if ! command -v ab &> /dev/null; then
    echo "Apache Bench is not installed. Installing..."
    sudo apt-get update
    sudo apt-get install -y apache2-utils
fi

# Test Mission Success by Nationality endpoint
echo "Testing Mission Success by Nationality endpoint..."
ab -n 1000 -c 50 -r -l "http://localhost:3001/api/statistics/mission-success-by-nationality"

# Test Mission Duration Stats endpoint
echo -e "\nTesting Mission Duration Stats endpoint..."
ab -n 1000 -c 50 -r -l "http://localhost:3001/api/statistics/mission-duration-stats" 