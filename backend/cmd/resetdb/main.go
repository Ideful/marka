package main

import (
	"context"
	"log"
	"os"

	"marka-backend/internal/db"
)

func main() {
	log.SetFlags(log.Ldate | log.Ltime | log.Lmicroseconds)

	ctx := context.Background()
	pool, err := db.Open(ctx)
	if err != nil {
		log.Fatalf("database: %v", err)
	}
	defer pool.Close()

	if err := db.Reset(ctx, pool); err != nil {
		log.Fatalf("reset: %v", err)
	}

	log.Println("database reset complete")
	os.Exit(0)
}
