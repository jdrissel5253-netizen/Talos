$ErrorActionPreference = "Stop"

Write-Host "Creating IAM Role: aws-elasticbeanstalk-ec2-role..."
try {
    aws iam create-role --role-name aws-elasticbeanstalk-ec2-role --assume-role-policy-document file://ec2_trust_policy.json --no-cli-pager
} catch {
    Write-Host "Role might already exist, continuing..."
}

Write-Host "Attaching Policies..."
aws iam attach-role-policy --role-name aws-elasticbeanstalk-ec2-role --policy-arn arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier --no-cli-pager
aws iam attach-role-policy --role-name aws-elasticbeanstalk-ec2-role --policy-arn arn:aws:iam::aws:policy/AWSElasticBeanstalkWorkerTier --no-cli-pager
aws iam attach-role-policy --role-name aws-elasticbeanstalk-ec2-role --policy-arn arn:aws:iam::aws:policy/AWSElasticBeanstalkMulticontainerDocker --no-cli-pager

Write-Host "Creating Instance Profile..."
try {
    aws iam create-instance-profile --instance-profile-name aws-elasticbeanstalk-ec2-role --no-cli-pager
} catch {
    Write-Host "Instance profile might already exist, continuing..."
}

Write-Host "Adding Role to Instance Profile..."
try {
    aws iam add-role-to-instance-profile --instance-profile-name aws-elasticbeanstalk-ec2-role --role-name aws-elasticbeanstalk-ec2-role --no-cli-pager
} catch {
    Write-Host "Role might already be in instance profile."
}

Write-Host "DONE! potentially wait 10 seconds for consistency."
