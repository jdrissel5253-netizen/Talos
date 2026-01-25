$ErrorActionPreference = "Stop"

Write-Host "Creating IAM Service Role: aws-elasticbeanstalk-service-role..."
try {
    aws iam create-role --role-name aws-elasticbeanstalk-service-role --assume-role-policy-document file://service_trust_policy.json --no-cli-pager
} catch {
    Write-Host "Role might already exist, continuing..."
}

Write-Host "Attaching Policies..."
aws iam attach-role-policy --role-name aws-elasticbeanstalk-service-role --policy-arn arn:aws:iam::aws:policy/service-role/AWSElasticBeanstalkEnhancedHealth --no-cli-pager
aws iam attach-role-policy --role-name aws-elasticbeanstalk-service-role --policy-arn arn:aws:iam::aws:policy/AWSElasticBeanstalkManagedUpdatesCustomerRolePolicy --no-cli-pager

Write-Host "DONE! potentially wait 10 seconds for consistency."
