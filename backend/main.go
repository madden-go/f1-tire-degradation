package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

type RaceTrack struct {
	ID          uint    `gorm:"primaryKey" json:"id"`
	Name        string  `json:"name"`
	Location    string  `json:"location"`
	Laps        int     `json:"laps"`
	BaseLapTime float64 `json:"base_lap_time"`
}

type TireCompound struct {
	ID       uint    `gorm:"primaryKey" json:"id"`
	Name     string  `json:"name"`
	WearRate float64 `json:"wear_rate"`
	LifeSpan int     `json:"life_span"`
}

func ConnectDatabase() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	user := os.Getenv("DB_USER")
	pass := os.Getenv("DB_PASSWORD")
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	name := os.Getenv("DB_NAME")

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		user, pass, host, port, name)

	database, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database!", err)
	}

	database.AutoMigrate(&RaceTrack{}, &TireCompound{})
	DB = database
}

func CreateTrack(c *gin.Context) {
	var input RaceTrack

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	result := DB.Create(&input)
	if result.Error != nil {
		c.JSON(500, gin.H{"error": "Could not save to database"})
		return
	}

	c.JSON(200, input)
}

func GetTracks(c *gin.Context) {
	var tracks []RaceTrack

	result := DB.Find(&tracks)

	if result.Error != nil {
		c.JSON(500, gin.H{"error": "Could not fetch tracks"})
		return
	}

	c.JSON(200, tracks)
}

func CalculateStrategy(c *gin.Context) {
	trackID := c.Param("id")
	compoundName := c.Query("compound")

	var track RaceTrack
	var tire TireCompound

	if err := DB.First(&track, trackID).Error; err != nil {
		c.JSON(404, gin.H{"error": "Track not found"})
		return
	}

	if err := DB.Where("name = ?", compoundName).First(&tire).Error; err != nil {
		c.JSON(400, gin.H{"error": "Invalid tire compound. Use Soft, Medium, or Hard"})
		return
	}

	type LapResult struct {
		Lap  int     `json:"lap"`
		Time float64 `json:"time"`
	}
	var results []LapResult

	for i := 1; i <= 10; i++ {
		currentLapTime := track.BaseLapTime + (float64(i) * tire.WearRate)
		results = append(results, LapResult{Lap: i, Time: currentLapTime})
	}

	c.JSON(200, gin.H{
		"track":    track.Name,
		"compound": tire.Name,
		"strategy": results,
	})
}

func SeedTires() {
	compounds := []TireCompound{
		{Name: "Soft", WearRate: 0.25, LifeSpan: 15},
		{Name: "Medium", WearRate: 0.12, LifeSpan: 30},
		{Name: "Hard", WearRate: 0.05, LifeSpan: 50},
	}

	for _, c := range compounds {
		var existing TireCompound
		DB.Where("name = ?", c.Name).First(&existing)
		if existing.ID == 0 {
			DB.Create(&c)
		}
	}
}

func GetFirstTrack(c *gin.Context) {
	var track RaceTrack
	result := DB.First(&track)
	if result.Error != nil {
		c.JSON(404, gin.H{"error": "No tracks found"})
		return
	}
	c.JSON(200, track)
}

func GetLastTrack(c *gin.Context) {
	var track RaceTrack
	result := DB.Last(&track)
	if result.Error != nil {
		c.JSON(404, gin.H{"error": "No tracks found"})
		return
	}
	c.JSON(200, track)
}

func SearchTracks(c *gin.Context) {
	name := c.Query("name")
	var tracks []RaceTrack

	DB.Where("name LIKE ?", "%"+name+"%").Find(&tracks)

	c.JSON(200, tracks)
}

func main() {
	ConnectDatabase()
	SeedTires()

	r := gin.Default()
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})

	r.POST("/tracks", CreateTrack)
	r.GET("/tracks", GetTracks)
	r.GET("/tracks/:id/strategy", CalculateStrategy)
	r.GET("/tracks/first", GetFirstTrack)
	r.GET("/tracks/last", GetLastTrack)
	r.GET("/tracks/search", SearchTracks)

	r.Run(":8080")
}
