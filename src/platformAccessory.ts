import { Service, PlatformAccessory, CharacteristicValue, CharacteristicSetCallback, CharacteristicGetCallback } from "homebridge";

import { BigAssFansHomebridge } from "./platform";
/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class BigAssAccessory {
  private service: Service;

  constructor(
    private readonly platform: BigAssFansHomebridge,
    private readonly accessory: PlatformAccessory,
  ) {

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, "BigAssFans")
  /*    .setCharacteristic(this.platform.Characteristic.Model, "Default-Model")
      .setCharacteristic(this.platform.Characteristic.SerialNumber, "Default-Serial");*/

    // get the LightBulb service if it exists, otherwise create a new LightBulb service
    // you can create multiple services for each accessory
    this.service = this.accessory.getService(this.platform.Service.Fan) || this.accessory.addService(this.platform.Service.Fan);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);


    // register handlers for the On/Off Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.On)
      .on("set", this.setOn.bind(this))               // SET - bind to the `setOn` method below
      .on("get", this.getOn.bind(this));               // GET - bind to the `getOn` method below
    
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, turning on a Light bulb.
   */
  setOn(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    this.accessory.context.device.power(value).then(power => callback(null, power))
  }


  getOn(callback: CharacteristicGetCallback) {
    this.accessory.context.device.power().then(power => callback(null, power))
  }
}
