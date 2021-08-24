$awsProfile = "movement-pass"
$app = "movement-pass"
$version = "v1"

$names = @("configuration", "certificates", "jwt", "photos", "database")

cdk bootstrap --profile $awsProfile

foreach ($name in $names) {
    cdk deploy $app-$name-$version --require-approval never --profile $awsProfile
}
