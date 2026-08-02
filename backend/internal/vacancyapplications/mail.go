package vacancyapplications

import (
	"fmt"
	"net/smtp"
	"strings"
)

const vacancyApplicationsEmail = "marka.arenva.love@gmail.com"

// Пароль приложения Gmail для vacancyApplicationsEmail.
const vacancySMTPAppPassword = ""

type smtpConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	From     string
	To       string
}

func vacancySMTPConfig() (smtpConfig, error) {
	if vacancySMTPAppPassword == "" {
		return smtpConfig{}, fmt.Errorf("vacancy SMTP app password is not set")
	}

	return smtpConfig{
		Host:     "smtp.gmail.com",
		Port:     587,
		User:     vacancyApplicationsEmail,
		Password: vacancySMTPAppPassword,
		From:     vacancyApplicationsEmail,
		To:       vacancyApplicationsEmail,
	}, nil
}

func sendApplicationEmail(cfg smtpConfig, subject, body string) error {
	addr := fmt.Sprintf("%s:%d", cfg.Host, cfg.Port)
	auth := smtp.PlainAuth("", cfg.User, cfg.Password, cfg.Host)

	headers := []string{
		fmt.Sprintf("From: %s", cfg.From),
		fmt.Sprintf("To: %s", cfg.To),
		fmt.Sprintf("Subject: %s", subject),
		"MIME-Version: 1.0",
		"Content-Type: text/plain; charset=UTF-8",
		"Content-Transfer-Encoding: 8bit",
	}
	msg := strings.Join(headers, "\r\n") + "\r\n\r\n" + body

	return smtp.SendMail(addr, auth, cfg.From, []string{cfg.To}, []byte(msg))
}
