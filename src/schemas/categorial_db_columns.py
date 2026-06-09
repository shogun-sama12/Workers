from enum import Enum

class ExperienceLevel(Enum):
    junior = "junior"
    middle = "middle"
    senior = "senior"

class EmploymentType(Enum):
    full_time = "full-time"
    part_time = "part-time"
    internship = "internship"

class WorkFormat(Enum):
    remote = "remote"
    office = "office"
    hybrid = "hybrid"