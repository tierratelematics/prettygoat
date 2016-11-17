##0.16.0

* add projection runner stats
* add split projection delete and the ability to control notifications of a projection - [spec](https://github.com/tierratelematics/prettygoat/blob/develop/test/SpecialStateSpec.ts)
* add snapshot delete and projection runner pause/resume

##0.15.0

* **breaking**: filter event types before scheduling (needs event_types view)
* query single buckets instead of entire history
* fix scheduling of ticks in the $init function

##0.14.2

Access bivio components from prettygoat

##0.14.1

Fix duplicated import of reflect-metadata

##0.14.0

Add feature toggle from *bivio* ([spec](https://github.com/tierratelematics/prettygoat/blob/master/test/EngineSpec.ts))