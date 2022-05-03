import json
import datetime
import time  

timediff = 1000*60*60

def interpolation(d, x):
    output = d[0][1] + (x - d[0][0]) * ((d[1][1] - d[0][1])/(d[1][0] - d[0][0]))
    return output

def mongoFormat(measurement):
    newmes = measurement
    times = newmes["measuredAt"]
    newmes["measuredAt"] = {}
    newmes["measuredAt"]["$date"] =  {}
    newmes["measuredAt"]["$date"]["$numberLong"] = str(times)
    temps = newmes["temperature"]
    newmes["temperature"] = {}
    newmes["temperature"]["$numberDouble"] = str(temps)
    hums = newmes["humidity"]
    newmes["humidity"] = {}
    newmes["humidity"]["$numberDouble"] = str(hums)
    return newmes
  
    

f = open('shortdata.json')

data = json.load(f)

newdata = []
for i in range(len(data)-1):
    measurements = [data[i], data[i+1]]
    newdata.append(measurements[0])
    for j in range(2):
        shortm = {}
        shortm["measuredAt"] = measurements[0]["measuredAt"] + (timediff * (j+1))
        shortm["temperature"] = interpolation([[measurements[0]["measuredAt"],measurements[0]["temperature"]],[measurements[1]["measuredAt"],measurements[1]["temperature"]]],shortm["measuredAt"] ) 
        shortm["humidity"] = interpolation([[measurements[0]["measuredAt"],measurements[0]["humidity"]],[measurements[1]["measuredAt"],measurements[1]["humidity"]]],shortm["measuredAt"] )
        """ shortm["measuredAt"] = {}
        shortm["measuredAt"]["$date"] =  {}
        shortm["measuredAt"]["$date"]["$numberLong"] = times """
        shortm["type"] = "hour"
        shortm["nodeId"] = {}
        shortm["nodeId"]["$oid"] = "6253e74ae7db67b599155785"
        shortm["locationId"] = {}
        shortm["locationId"]["$oid"] = "625416218573f8a907a89f65"
        newdata.append(shortm)

    """ stime = newdata[len(newdata)-3]["measuredAt"]
    newdata[len(newdata)-3]["measuredAt"] = {}
    newdata[len(newdata)-3]["measuredAt"]["$date"] =  {}
    newdata[len(newdata)-3]["measuredAt"]["$date"]["$numberLong"] = stime """

for i in range(len(newdata)-1):
    newdata[i] = mongoFormat(newdata[i])

with open("newshortdata.json", "w") as write_file:
    json.dump(newdata, write_file, indent=4)

    #{"_id":{"$oid":"625d9a44c4ba3e2296a32251"},"temperature":{"$numberDouble":"20.19"},"humidity":{"$numberDouble":"35.11"},"measuredAt":{"$date":{"$numberLong":"1651525200000"}},"type":"hour","nodeId":{"$oid":"6253e74ae7db67b599155785"},"locationId":{"$oid":"625416218573f8a907a89f65"},"__v":{"$numberInt":"0"}}