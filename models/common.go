package models

// Common enums and constants

const (
    JobTypeFullTime = "full-time"
    JobTypeContract = "contract"
    JobTypeIntern   = "intern"
)

type LocationType string

const (
    LocationRemote LocationType = "remote"
    LocationHybrid LocationType = "hybrid"
    LocationOnsite LocationType = "onsite"
)
