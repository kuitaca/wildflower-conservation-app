package main

import (
    "encoding/json"
    "log"
    "net/http"
    "os"

    "github.com/labstack/echo/v4"
    "github.com/labstack/echo/v4/middleware"
)

type Plant struct {
    ID           string   `json:"id"`
    ScientificName string `json:"scientificName"`
    CommonName     string `json:"commonName"`
    PlantType      string `json:"plantType"`
    MatureHeight   string `json:"matureHeight"`
    BloomColors    []string `json:"bloomColors"`
    BloomPeriod    []string `json:"bloomPeriod"`
    SoilType       []string `json:"soilType"`
    LightRequirement string `json:"lightRequirement"`
    WildlifeSupport WildlifeSupport `json:"wildlifeSupport"`
    EndangeredConnections []EndangeredConnection `json:"endangeredSpeciesConnections"`
}

type WildlifeSupport struct {
    ButterfliesMoths int `json:"butterfliesMoths"`
    NativeBees      int `json:"nativeBees"`
    Birds           int `json:"birds"`
    TotalInsects    int `json:"totalInsects"`
}

type EndangeredConnection struct {
    Species         string `json:"species"`
    ScientificName  string `json:"scientificName"`
    Relationship    string `json:"relationship"`
    Status          string `json:"status"`
    Significance    string `json:"significance"`
}

type PlantDatabase struct {
    Plants []Plant `json:"plants"`
}

func main() {
    e := echo.New()
    
    // Middleware
    e.Use(middleware.Logger())
    e.Use(middleware.Recover())
    e.Use(middleware.CORS())

    // Routes
    e.GET("/api/plants", getPlants)
    e.GET("/api/plants/:id", getPlant)
    e.GET("/api/health", healthCheck)

    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }

    log.Printf("Server starting on port %s", port)
    e.Logger.Fatal(e.Start(":" + port))
}

func getPlants(c echo.Context) error {
    data, err := os.ReadFile("data/wildflowers.json")
    if err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to read plant data"})
    }

    var database PlantDatabase
    if err := json.Unmarshal(data, &database); err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to parse plant data"})
    }

    return c.JSON(http.StatusOK, database.Plants)
}

func getPlant(c echo.Context) error {
    id := c.Param("id")
    
    data, err := os.ReadFile("data/wildflowers.json")
    if err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to read plant data"})
    }

    var database PlantDatabase
    if err := json.Unmarshal(data, &database); err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to parse plant data"})
    }

    for _, plant := range database.Plants {
        if plant.ID == id {
            return c.JSON(http.StatusOK, plant)
        }
    }

    return c.JSON(http.StatusNotFound, map[string]string{"error": "Plant not found"})
}

func healthCheck(c echo.Context) error {
    return c.JSON(http.StatusOK, map[string]string{"status": "healthy"})
}
