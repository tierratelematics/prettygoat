# 6.2.1

Rewrite readmodels notify using buffers

# 6.2.0

Logs uncaught exceptions

# 6.1.4

Fix an error with the authorization middleware

# 6.1.3

Fix a regression for the state retrieve API

# 6.1.2

Add some logs to the APIs
# 6.1.0

Add multiple notification keys to readmodels

# 6.0.0

* Remove Redis
* Add notify to readmodels
* Minor bugfixes

# 5.4.0

* Add memento producer
* Snapshot event metadata

# 5.3.0

* Cache snapshots
* Fix some bugs

# 5.2.0

Add retry management

# 5.1.0

* Add contextual logging
* Add api for retrieving full projection state

# 5.0.2

Start from the last event of a snapshot if the ringbuffer is not available

# 5.0.1

Improve ring buffer serialization

# 5.0.0

* Add id to events
* Refactor streams in order to allow more control

# 4.0.0

* Remove split projections
* Remove wildcards
* Add notify fields
* Change readmodels access to filter strategy
* rxjs 5
* Many other little things

# 3.6.2

Fix memory growth with lots of events

# 3.6.1

Fix stackoverflow on async handlers

# 3.6.0

Add redis client

# 3.5.1

Use portscanner instead of tcp-port-used

# 3.5.0

Add IRedisConfig

# 3.4.0

Add synchronization to lookup service

# 3.3.0

Projection runner optimizations

# 3.2.0

* Correctly lookup keys while replaying the events
* Add lazyInject

# 3.1.0

Add [lookup service](https://github.com/tierratelematics/prettygoat/wiki/Lookup-service).

# 3.0.0

* Update the contract when subscribing to projection's changes (see [chupacabras](https://github.com/tierratelematics/chupacabras)).

# 2.2.0

* Add async management of event/split handlers
* Add multiple split keys

# 2.1.1

* Bump bivio version

# 2.1.0

* fix type signature for IFilterStrategy (no need to cast returned state)

# 2.0.1

* fix lodash types

# 2.0.0

* remove cassandra related code into separated module ([prettygoat-cassandra](https://github.com/tierratelematics/prettygoat-cassandra))

# 1.2.1

* don't send content type on 204 responses
* drop useless charset-utf8 on json content type

# 1.2.0

* add driver options to cassandra config

# 1.1.0

* add health check endpoint
* change split init sequence

# 1.0.0

* split IEndpointConfig to INotificationConfig
* add cassandra secure credentials

# 1.0.0-rc3

* remove old cassandra type parser
* rename CassandraDeserializer to EventDeserializer

# 1.0.0-rc2

* fix notifications sampling for split projections
* projection restart
* handle query strings on clients subscribe

# 1.0.0-rc1

* *breaking* projections exposed under /projections
* inversify 3.1.0
* complete rewrite of routing stack
* use prepared statements
* optimize snapshots save
* use socket.io rooms
* many other little things

# 0.20.0

* check for projections with same name
* add authorization for apis
* fix snapshots retrieve with undefined strings

# 0.19.5 - 0.19.2

* various fixes for snapshot save with single quotes

# 0.19.0

* typescript 2.1 support
* move to smild 4

# 0.18.0

* add API for projections and snapshots
* add filtering of events directly on Cassandra (requires event_types and event_by_manifest tables)

# 0.17.3

* fix OperationTimedOut errors
* optimize readmodels publishing
* remove the need of an event_types table

# 0.17.2

* fix some bugs with split events match
* fix split delete type checking

# 0.17.1

* fix snapshots save

# 0.17.0

* handle events backpressure
* change projections_snapshots table primary key
* add events processed to diagnostic

# 0.16.3

* fix wrong scheduling of readmodels

# 0.16.2

* fixes an error with split projection events not matched

# 0.16.1

* fixes an error with the dts

# 0.16.0

* add projection runner stats
* add split projection delete and the ability to control notifications of a projection - [spec](https://github.com/tierratelematics/prettygoat/blob/develop/test/SpecialStateSpec.ts)
* add snapshot delete and projection runner pause/resume

# 0.15.0

* **breaking**: filter event types before scheduling (needs event_types view)
* query single buckets instead of entire history
* fix scheduling of ticks in the $init function

# 0.14.2

Access bivio components from prettygoat

# 0.14.1

Fix duplicated import of reflect-metadata

# 0.14.0

Add feature toggle from *bivio* ([spec](https://github.com/tierratelematics/prettygoat/blob/master/test/EngineSpec.ts))