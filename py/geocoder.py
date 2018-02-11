#!/usr/bin/env python3
import csv
import json
import pdb
import secrets
import time
import urllib.request

geocoder_url_base = "https://maps.googleapis.com/maps/api/geocode/json?"\
                    "address=%s&key=%s"
geocoder_url = geocoder_url_base % ("%s", secrets.api_key)

# HX: If multiple locations found
# HX: Err on ambiguity
# HX: Location box
# HX: Response code != 200

def get_lon_lat(location):
    # Sleep to avoid rate-limiting
    time.sleep(1)
    resp = urllib.request.urlopen(geocoder_url % (location.replace(" ", "+")))
    resp_json = json.loads(resp.read().decode("utf-8"))
    try:
        location = resp_json["results"][0]["geometry"]["location"]
    except IndexError:
        # Use (0, 0) as the coordinate for unknown locations
        if resp_json['status'] == 'ZERO_RESULTS':
            return (0, 0)
    return (location["lng"], location["lat"])

def update_locations():
    with open ("../errors.log", "a") as error_log,\
         open("../csv/locations.csv", "r+") as locations_csv,\
         open("../csv/events_BayArea.csv", "r") as events_csv:
        locations_dict = {}
        for row in csv.reader(locations_csv, delimiter=";"):
            locations_dict[row[0]] = row[1:]
        
        for row in csv.reader(events_csv):
            location = row[3]
            # Skip known locations
            if location in locations_dict:
                continue
            try:
                coords = get_lon_lat(location)
            except Exception as e:
                error_log.write("%s: %s\n" % (location, e))
                continue
            new_row = ";".join([location, str(coords[0]), str(coords[1])])
            locations_csv.write(new_row + "\n")
            locations_dict[location] = coords

if __name__ == "__main__":
    update_locations()

