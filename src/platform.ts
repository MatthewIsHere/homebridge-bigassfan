import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from "homebridge";

import { PLATFORM_NAME, PLUGIN_NAME } from "./settings";
import { BigAssAccessory } from "./platformAccessory";
import { FanController } from "bigassfanjs"

export class BigAssFansHomebridge implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  // this is used to track restored cached accessories
  public readonly accessories: PlatformAccessory[] = [];

  public readonly logTraffic
  private controller

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log.debug("Finished initializing platform:", this.config.name);

    let platforms: any[] = config.platforms as any[]
    let bigAssFanConfig: any = platforms.find(platform => platform.platform === "BigAssFans") as any
    this.logTraffic = bigAssFanConfig.logTraffic
    //Sets up the fan controller class which manages fan messages for accessories
    this.controller = new FanController(false, this.logTraffic)

    // When this event is fired it means Homebridge has restored all cached accessories from disk.
    // Dynamic Platform plugins should only register new accessories after this event was fired,
    // in order to ensure they weren"t added to homebridge already. This event can also be used
    // to start discovery of new accessories.
    this.api.on("didFinishLaunching", () => {
      this.log.debug("Executed didFinishLaunching callback");
      this.discoverDevices();
    });
  }

  /**
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to setup event handlers for characteristics and update respective values.
   */
  configureAccessory(accessory: PlatformAccessory) {
    this.log.info("Loading accessory from cache:", accessory.displayName);

    // add the restored accessory to the accessories cache so we can track if it has already been registered
    this.accessories.push(accessory);
  }

  discoverDevices() {
    this.controller.on("newFan", fan => {
      const uuid = this.api.hap.uuid.generate(fan.mac)
      const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid)
      if (existingAccessory) {
        this.log.info("Restoring existing accessory from cache:", existingAccessory.displayName);
        new BigAssAccessory(this, existingAccessory, fan);
      } else {
        this.log.info("Adding new accessory:", fan.name);
        const accessory = new this.api.platformAccessory(fan.name, uuid);
        new BigAssAccessory(this, accessory, fan);
        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      }
    })
    this.controller.discover()
  }
}
