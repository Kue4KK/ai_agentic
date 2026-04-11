# backend/schemas.py

from pydantic import BaseModel

class SensorSchema(BaseModel):
    id: int
    air_temperature: float
    process_temperature: float
    rotational_speed: int
    torque: float
    tool_wear: int

    class Config:
        orm_mode = True


class MachineSchema(BaseModel):
    id: int
    name: str
    location: str
    sensors: list[SensorSchema] = []

    class Config:
        orm_mode = True