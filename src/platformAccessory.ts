import { Service, PlatformAccessory, CharacteristicValue, CharacteristicSetCallback, CharacteristicGetCallback } from "homebridge"

import { BigAssPlatform } from "./platform"
import { BigAssFan } from "bigassfanjs"

export class BigAssAccessory {

  private service: Service;
  constructor(
    private readonly platform: BigAssPlatform,
    private readonly accessory: PlatformAccessory,
    private fan: BigAssFan
  ) {

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, "BigAssFans")
      .setCharacteristic(this.platform.Characteristic.Model, "BigAssFan")
      .setCharacteristic(this.platform.Characteristic.SerialNumber, fan.mac)

    //sets service to Fan
    this.service = this.accessory.getService(this.platform.Service.Fan) || this.accessory.addService(this.platform.Service.Fan)

    // set the service name, this is what is displayed as the default name on the Home app
    this.service.setCharacteristic(this.platform.Characteristic.Name, fan.name)


    // register handlers for properties
    this.service.getCharacteristic(this.platform.Characteristic.On)
      .on("set", this.setOn.bind(this))              
      .on("get", this.getOn.bind(this))
    this.service.getCharacteristic(this.platform.Characteristic.RotationSpeed)
      .on("set", this.setSpeed.bind(this))
      .on("get", this.getSpeed.bind(this))
  }

  setOn(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    this.fan.power(value).then(() => callback(undefined, undefined))
  }
  getOn(callback: CharacteristicGetCallback) {
    this.fan.power().then(power => callback(undefined, power))
  }

  setSpeed(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    let outOfSeven = Math.round(((value as number*7)/100))
    this.fan.speed(outOfSeven).then(() => callback(undefined, undefined))
  }
  getSpeed(callback: CharacteristicGetCallback) {
    this.fan.speed().then(speed => {
      let outOfHundred = Math.round((speed*100)/7)
      callback(undefined, outOfHundred)
    })
  }
}
