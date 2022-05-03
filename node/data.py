import json
import time
timediff = 161557200+(26*60*60)

def kelvinToCelsius(kelvin):
    return kelvin - 273.15

f = open('data.json')

prague = json.load(f)

data = []

for measurement in prague["data"]:
    shortm = {}
    shortm["temperature"] = kelvinToCelsius(measurement["main"]["temp"])
    shortm["humidity"] = measurement["main"]["humidity"] / 100
    shortm["measuredAt"] = (measurement["dt"] + timediff) * 1000
    """ shortm["measuredAt"] = datetime.datetime.fromtimestamp((measurement["dt"] + 161913600))
    shortm["measuredAt"] = shortm["measuredAt"].strftime("%Y-%m-%dT%H:%M:%S.%f%z") """
    shortm["type"] = "hour"
    shortm["nodeId"] = {}
    shortm["nodeId"]["$oid"] = "6253e74ae7db67b599155785"
    shortm["locationId"] = {}
    shortm["locationId"]["$oid"] = "625416218573f8a907a89f65"
    data.append(shortm)

print(data)
with open("shortdata.json", "w") as write_file:
    json.dump(data, write_file, indent=4)