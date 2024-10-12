package main

import "github.com/gin-gonic/gin"

func main() {
	r := gin.Default()
	r.GET("/users/:id/wallet", nil)
	r.POST("/topup", nil)
	r.POST("/buyGift", nil)
	r.Run(":8080")
}
