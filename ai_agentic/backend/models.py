# backend/models.py

from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Machine(Base):
    __tablename__ = "machines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    location = Column(String(100))

    sensors = relationship("SensorData", back_populates="machine")


class SensorData(Base):
    __tablename__ = "sensor_data"

    id = Column(Integer, primary_key=True, index=True)
    machine_id = Column(Integer, ForeignKey("machines.id"))

    air_temperature = Column(Float)
    process_temperature = Column(Float)
    rotational_speed = Column(Integer)
    torque = Column(Float)
    tool_wear = Column(Integer)

    machine = relationship("Machine", back_populates="sensors")