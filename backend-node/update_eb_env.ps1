$namespace = "aws:elasticbeanstalk:application:environment"
$options = @(
    "Namespace=$namespace,OptionName=RDS_HOSTNAME,Value=awseb-e-wsmmcq2zc3-stack-awsebrdsdatabase-ehqy2gn0naaf.ckj8wi4e4l42.us-east-1.rds.amazonaws.com",
    "Namespace=$namespace,OptionName=RDS_PORT,Value=5432",
    "Namespace=$namespace,OptionName=RDS_DB_NAME,Value=ebdb",
    "Namespace=$namespace,OptionName=RDS_USERNAME,Value=talosuser",
    "Namespace=$namespace,OptionName=RDS_PASSWORD,Value=TalosAdmin2024!New",
    "Namespace=$namespace,OptionName=USE_POSTGRES,Value=true"
)

Write-Host "Updating Elastic Beanstalk environment..."
aws elasticbeanstalk update-environment --environment-name talos-hvac-backend-env --option-settings $options
