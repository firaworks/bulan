package core

import (
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/mediaconvert"
	"github.com/discuitnet/discuit/internal/uid"
)

type AwsHandler struct {
	ID                uid.ID `json:"id"`
	Username          string `json:"username"`
	UsernameLowerCase string `json:"-"`
}

func GetMediaConvertClient(keyId, secret, region string) *mediaconvert.Client {
	cfg := aws.Config{
		Region: region,
		Credentials: credentials.StaticCredentialsProvider{
			Value: aws.Credentials{
				AccessKeyID:     keyId,
				SecretAccessKey: secret,
			},
		},
	}
	return mediaconvert.NewFromConfig(cfg)
}
