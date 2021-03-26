import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from "homebridge"

import { PLATFORM_NAME, PLUGIN_NAME } from "./settings"
import { BigAssAccessory } from "./platformAccessory"
import { FanController } from "bigassfanjs"

export class BigAssPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic
  // this is used to track restored cached accessories
  public readonly accessories: PlatformAccessory[] = []
  //bigassfanjs fancontroller class to manage fan discovery
  private controller: FanController

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.controller = new FanController(false, this.config.logTraffic)
    this.api.on("didFinishLaunching", this.finishedLaunching)
  }

  private finishedLaunching(): void {
    this.log.debug("Executed didFinishLaunching callback")
    this.discoverDevices()
  }

  configureAccessory(accessory: PlatformAccessory) {
    this.log.info("Loading accessory from cache:", accessory.displayName)
    this.accessories.push(accessory)
  }

  private discoverDevices() {
    this.controller.on("newFan", fan => {
      const uuid = this.api.hap.uuid.generate(fan.mac)
      const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid)
      if (existingAccessory) {
        this.log.info("Restoring existing accessory from cache:", existingAccessory.displayName)
        new BigAssAccessory(this, existingAccessory, fan)
      } else {
        this.log.info("Adding new accessory:", fan.name)
        const accessory = new this.api.platformAccessory(fan.name, uuid)
        new BigAssAccessory(this, accessory, fan)
        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory])
      }
    })
    this.controller.discover()
  }
}
