# [2.2.0](https://github.com/ClashStrategic/stats/compare/v2.1.0...v2.2.0) (2026-07-14)


### Bug Fixes

* **data:** rebalance card combat attributes ([09379f1](https://github.com/ClashStrategic/stats/commit/09379f1db00ddae17b4b22ef9ddf2984f8cc45e4))


### Features

* **api:** implement reflect skill type ([04e4e7c](https://github.com/ClashStrategic/stats/commit/04e4e7c580981da6d9412b2dc6856e0f52fadf8b))
* **card:** add ronin troop card ([28303a7](https://github.com/ClashStrategic/stats/commit/28303a7ce3e8b65304ca8238db8f547013122ca3))
* **cards:** add spawn-on-death skill to evolution stats ([5c2707a](https://github.com/ClashStrategic/stats/commit/5c2707a85b930fbab3687614f1a8138590e66b58))
* **cards:** implement ramping-damage skill for selected units ([386ba57](https://github.com/ClashStrategic/stats/commit/386ba57122746899b675ae53ce236c7ed6edca40))
* **data:** add speed boost attribute to card definitions ([fdded59](https://github.com/ClashStrategic/stats/commit/fdded59b450fa4d63fde2133776de8efea2f81a1))
* **schema:** add ramping-damage skill type ([d92189d](https://github.com/ClashStrategic/stats/commit/d92189dd0e30340cc673f87e58b3ced60e3f6072))
* **skills:** add reflect skill configuration to card definitions ([3d4566f](https://github.com/ClashStrategic/stats/commit/3d4566fac5c476747ede62f22cc0946b1d1fe584))

# [2.1.0](https://github.com/ClashStrategic/stats/compare/v2.0.0...v2.1.0) (2026-06-02)


### Bug Fixes

* **data:** remove redundant spawn-on-death skill definitions ([4452773](https://github.com/ClashStrategic/stats/commit/4452773fae42da326e3d9edca4a77b65388854e0))
* **data:** update card balance stats for multiple units ([3753f0b](https://github.com/ClashStrategic/stats/commit/3753f0b8f93c747fe0829dc10c8f05275c8faca7))


### Features

* **data:** add evolution heal skills to card data ([fdf12f7](https://github.com/ClashStrategic/stats/commit/fdf12f743d7d8bb61757a98b69d0f80a67a0b4d8))
* **data:** add spawn-on-death skill to evolved battle ram ([7da9e4d](https://github.com/ClashStrategic/stats/commit/7da9e4d2b68f0cbb746c9bd4bd25c7fb7df5ae54))
* **data:** update death damage and spawn stats for cards ([dc20211](https://github.com/ClashStrategic/stats/commit/dc202112c59ae86b9fb8b3a44f5db2abae0a25dc))
* **evolution:** implement Princess evolution stats and mechanics ([0f601db](https://github.com/ClashStrategic/stats/commit/0f601db516ec1c2155141fa24f3ab321e186f966))
* **hero:** update Tombstone hero status and ability configuration ([a64814e](https://github.com/ClashStrategic/stats/commit/a64814efd65c29e24b1872af9392474005d5c5d6))
* **projectile-number:** add projectileNumber field to card schema and data ([f7ebe19](https://github.com/ClashStrategic/stats/commit/f7ebe195e54550f84e6cb347c45f324a2791ffc5))
* **skills:** add area-damage-on-death stats to card definitions ([3849b2f](https://github.com/ClashStrategic/stats/commit/3849b2f2cef24310701ede1ebbd1d011f42bcbc9))
* **tower-damage:** add towerDamage to evolution statistics ([f652fd4](https://github.com/ClashStrategic/stats/commit/f652fd467f9b726856e6e9ccdf9c57755999db0b))

# [2.0.0](https://github.com/ClashStrategic/stats/compare/v1.10.1...v2.0.0) (2026-05-19)


* feat(core)!: introduce specialized tower card schema and types ([0a20582](https://github.com/ClashStrategic/stats/commit/0a205820e4a063e006a68b0d17870d7c1c3e5abd))
* refactor!: remove generation properties from card definitions ([17d6b5f](https://github.com/ClashStrategic/stats/commit/17d6b5fbe40b79d92109a0e548f88fc3723881a6))
* refactor(config)!: convert project to ECMAScript Modules (ESM) ([2011e4f](https://github.com/ClashStrategic/stats/commit/2011e4f6d2150b5b4fcf2d44e55936ea193a0dbb))
* refactor(core)!: remove level 15 stats from card data and schemas ([a4d3fda](https://github.com/ClashStrategic/stats/commit/a4d3fdae5cb7e2a911f9695816ef4f7b48fe829f))
* refactor(data)!: remove chargeDamage and migrate to skills schema ([742a53f](https://github.com/ClashStrategic/stats/commit/742a53f2fb8fbe46b767bfa204506e1994190ade))
* refactor(data)!: remove fatalDamage property from cards ([cbf3b2f](https://github.com/ClashStrategic/stats/commit/cbf3b2fea3c3a594d920c1069a584c4f8da8008a))
* refactor(data)!: rename evolution and hero stat keys in cards.json ([0c498b8](https://github.com/ClashStrategic/stats/commit/0c498b840c8a1d4fe3e255bba943d0765ee825ea))
* refactor(data)!: rename suicide property to kamikaze in card definitions ([179a669](https://github.com/ClashStrategic/stats/commit/179a66971d2a61ca0ca50d15705300829b8f9635))
* refactor(data)!: rename territory to placement in card definitions ([c985760](https://github.com/ClashStrategic/stats/commit/c985760dc1035cf10668e7be3ee66fed5619c097))
* refactor(data)!: rename typeAttack to hitType in card definitions ([8e56b7a](https://github.com/ClashStrategic/stats/commit/8e56b7add704807caf2a892f43bcd699ceb43d24))
* refactor(schema)!: deprecate and remove hero prestigeCost ([fdbd0f1](https://github.com/ClashStrategic/stats/commit/fdbd0f18dc1560e3a11e04d38a2c30c4ae1cb8a1))


### Bug Fixes

* **cards:** define ability and prestige costs for Dark Prince and Bowler ([677b0b1](https://github.com/ClashStrategic/stats/commit/677b0b1009a7da909b52eec84ba44c78839871f2))
* **cards:** prevent infinite recursion in ability skill definitions ([6e1b483](https://github.com/ClashStrategic/stats/commit/6e1b483f873d9cfefdf685eab96f96d4f6864361))
* **data:** enable kamikaze property for specific unit definitions ([fc9246f](https://github.com/ClashStrategic/stats/commit/fc9246fce8678106d397b54f6bee112b28216383))
* **data:** ensure float types for card skill and radius values ([7de376c](https://github.com/ClashStrategic/stats/commit/7de376c3081628e0276f110d09c407592e17f7b3))
* **data:** populate missing towerDamage values for multiple units ([69c1402](https://github.com/ClashStrategic/stats/commit/69c1402fc8d630a7e64d583a7d02ad3b77074b4b))
* **data:** update card range values in cards.json ([e7ff0d5](https://github.com/ClashStrategic/stats/commit/e7ff0d5960a0791823629f3dc55b86c81d551177))
* **data:** update card stats for balance tuning ([1831f9c](https://github.com/ClashStrategic/stats/commit/1831f9c59eae4d822f6fad24056c898ab210520c))


### Features

* **attributes:** add core gameplay attributes to card definitions ([ee9e1fe](https://github.com/ClashStrategic/stats/commit/ee9e1fe51a45ba7c9bab5e60a07262dd05de1f6e))
* **cards:** populate recursive skill definitions for champion abilities ([26b78cf](https://github.com/ClashStrategic/stats/commit/26b78cfb7ea26fbc3aa924343169fccdc49bc476))
* configure pre-compiled lib/ distribution for direct git consumption ([f33365e](https://github.com/ClashStrategic/stats/commit/f33365e622be6365aaaa7e133477a9268289130c))
* **flying:** add flying property to card objects ([dfb06c9](https://github.com/ClashStrategic/stats/commit/dfb06c9c302a702d23735bd8495b822b9a29188b))
* **hero:** define hero status and abilities for Dark Prince and Bowler ([6ed4b2d](https://github.com/ClashStrategic/stats/commit/6ed4b2d8b6e4866ea6b70d8120842373e3a23f7f))
* implement TypeScript types and JSON schema for card data ([a1f66e6](https://github.com/ClashStrategic/stats/commit/a1f66e65b41fc88840d103078abfe0eec6c596e0))
* **schema:** support recursive skill definitions in abilities ([029ef89](https://github.com/ClashStrategic/stats/commit/029ef89eab4fa7dba45dcfc1b2fefeac75a30106))
* **skills:** add skills and hero abilities to card definitions ([0969fdf](https://github.com/ClashStrategic/stats/commit/0969fdf8a499bb84f04f48836715fe8677870487))


### BREAKING CHANGES

* Tower cards now use a dedicated `TowerCard` structure and validation schema instead of the generic `Card` model. Redundant and unused properties have been removed from tower entries, requiring consumers to update their type assumptions, schema integrations, and data mappings.
* The `level15` property has been removed from the `Levels` interface and all card stat objects. Any consumers relying on level 15 data will need to update their logic.
* The `territory` field has been removed from the Card interface and JSON data in favor of `placement`.
* The `typeAttack` property has been renamed to `hitType` across card definitions, schema validation, and TypeScript interfaces. Any consumers using the old property name must update their implementations accordingly.
* The `generationSpeed` and `generationUnits` properties have been removed from card definitions and related TypeScript interfaces. Any consumers relying on these fields must remove or replace their usage.
* The `suicide` property has been renamed to `kamikaze`. Any integrations or scripts relying on the `suicide` key in the card JSON or TypeScript objects must be updated to use `kamikaze`.
* The `chargeDamage` field has been removed from the card data structure and schema. Use `skills.charge.damage` instead.
* The `fatalDamage` field has been removed from the card objects in `cards.json` and is no longer supported in `Card` types or validation schemas.
* The `statsEvo` and `statsHero` properties have been renamed to `evoStats` and `heroStats` respectively. Any consumers parsing `cards.json` must update their property references to match the new naming convention.
* The `prestigeCost` property has been removed from hero card definitions and related TypeScript interfaces. Any consumers relying on this field must update their integrations and data mappings accordingly.
* Card data structure and file locations have changed. Card definitions are now stored under the `data/` directory and must comply with the new TypeScript interfaces and AJV JSON schema validation rules. Existing consumers relying on the previous schema or file paths will need to update their integrations.
* The project now uses native ECMAScript Modules (ESM). CommonJS imports (`require`) and exports (`module.exports`) are no longer supported. Consumers must migrate to ESM syntax or use compatible interop tooling.

## [1.10.1](https://github.com/ClashStrategic/stats/compare/v1.10.0...v1.10.1) (2026-04-12)


### Bug Fixes

* **data:** adjust Battle Ram attributes for balance consistency ([31b2c96](https://github.com/ClashStrategic/stats/commit/31b2c969ab9941e56600939c1b7807e60210a475))
* **data:** adjust card scaling values for level 11, 15, and 16 ([6e92a6a](https://github.com/ClashStrategic/stats/commit/6e92a6a9ec68ce013c7f2d8d24e65149980844fa))
* **data:** correct Skeleton Barrel hitpoints and hitspeed values ([4b7f9e3](https://github.com/ClashStrategic/stats/commit/4b7f9e35fabbaf35008dd2708866bb4fca2e6442))
* **data:** remove hitspeed stat for Royal Delivery ([03a9569](https://github.com/ClashStrategic/stats/commit/03a9569a2c9d373c1c1c1bc60985539830cefc08))
* **data:** update damage and hitspeed stats for Suspicious Bush ([e6747f1](https://github.com/ClashStrategic/stats/commit/e6747f12f86f384de9d1f577d178948954f88aca))
* **data:** update tower damage and hitpoints for Goblin Drill ([47453f8](https://github.com/ClashStrategic/stats/commit/47453f8b752de3d893f146f34f37dd3eae88ed74))

# [1.10.0](https://github.com/ClashStrategic/stats/compare/v1.9.0...v1.10.0) (2026-04-08)


### Bug Fixes

* **data:** update hitspeed in cards configuration ([14a6c64](https://github.com/ClashStrategic/stats/commit/14a6c64acef702376c905300f05be8b6dcd608fc))
* **data:** update prestige cost, hitspeed, and damage stats ([e31650c](https://github.com/ClashStrategic/stats/commit/e31650ce61b7d8fc8032c76608b0811f0d620337))


### Features

* **data:** enable evolution and define stats for Minion Horde ([506293a](https://github.com/ClashStrategic/stats/commit/506293ac22c70c80a5b2f0d12a6571b0dfd19b64))
* **data:** update hero status and prestige cost for card Balloon ([d7a879e](https://github.com/ClashStrategic/stats/commit/d7a879efc91f19db1c7addc7e87d6a75818b2e52))

# [1.9.0](https://github.com/ClashStrategic/stats/compare/v1.8.1...v1.9.0) (2026-03-03)


### Bug Fixes

* **data:** update card attack types to unique ([4423dc6](https://github.com/ClashStrategic/stats/commit/4423dc66389e886c50b724a6244d737b75357879))
* **data:** update card statistics and balance values ([d9064fc](https://github.com/ClashStrategic/stats/commit/d9064fcf0fa7dc565fad265dc13838e25242e498))


### Features

* **heroes:** enable hero traits and assign resource requirements ([6788526](https://github.com/ClashStrategic/stats/commit/67885261c251ff66eb1c101584312f1e53a32d0a))

## [1.8.1](https://github.com/ClashStrategic/stats/compare/v1.8.0...v1.8.1) (2026-01-28)


### Bug Fixes

* **data:** reduce unit counts for multiple card entries ([3014fa4](https://github.com/ClashStrategic/stats/commit/3014fa43d12b88e72beac33ddedd9f4d2e404c36))
* **data:** update card damage and hitpoints values in cards.json ([8d46789](https://github.com/ClashStrategic/stats/commit/8d467898af65c701d3a0d4168b2dd205583b4554))
* **data:** update card target definitions in cards.json ([15be03b](https://github.com/ClashStrategic/stats/commit/15be03bffe382c6655a66befbb8690ef43187519))
* **data:** update movement speed values for multiple cards in cards.json ([3ebb058](https://github.com/ClashStrategic/stats/commit/3ebb058d45979a7e90f1c8029d44a9632588aea5))
* **data:** update projectile property for multiple card entries ([d51f7db](https://github.com/ClashStrategic/stats/commit/d51f7db33c25a4d0ce2ada3c7e3d227f7c1577c7))
* **data:** update radius values and attack type classification ([78f59ae](https://github.com/ClashStrategic/stats/commit/78f59aebe728944ff49772fc924e9f2f0dd6589d))
* **data:** update unit generation stats in cards.json ([f4f7652](https://github.com/ClashStrategic/stats/commit/f4f7652dc1ceb4df6717d2b6dc2d26454ec2d389))

# [1.8.0](https://github.com/ClashStrategic/stats/compare/v1.7.0...v1.8.0) (2026-01-22)


### Bug Fixes

* **cards:** update damage and tower damage statistics ([ef59ad8](https://github.com/ClashStrategic/stats/commit/ef59ad8634ffea064bacc43fe11273bf9c66c3da))


### Features

* **hero-cards:** set hero status and prestige costs ([a77b745](https://github.com/ClashStrategic/stats/commit/a77b745227d271e89fca48b3b8718f79c3c78100))
* **hero:** add hero and statsHero fields ([badc20f](https://github.com/ClashStrategic/stats/commit/badc20f82e5fd1372e1e09db9d88b8acd193a36b))
* **hero:** update hero statuses and prestige costs ([d932c44](https://github.com/ClashStrategic/stats/commit/d932c44b11b8d2fd93f4565610b2f0ae54ad7b56))

# [1.7.0](https://github.com/ClashStrategic/stats/compare/v1.6.0...v1.7.0) (2026-01-19)


### Bug Fixes

* **cards:** update balance and damage statistics ([0bae1a9](https://github.com/ClashStrategic/stats/commit/0bae1a993e65e3c323c30ebf84371b9e9a1ccf0a))


### Features

* **level16:** add level 16 statistics ([f40265f](https://github.com/ClashStrategic/stats/commit/f40265f9493ba87380a6394b72e80548df3a5067))

# [1.6.0](https://github.com/ClashStrategic/stats/compare/v1.5.0...v1.6.0) (2025-11-07)


### Bug Fixes

* **cards:** update stats for multiple cards ([686d4fe](https://github.com/ClashStrategic/stats/commit/686d4feaa0b6fe40046dcd6a2cf59ae785bc59fb))
* **cards:** update stats for multiple cards ([b07e409](https://github.com/ClashStrategic/stats/commit/b07e409e648085638a0a47269aafaee3a5f6fdc2))


### Features

* **evolution:** enable evolution for Royal Hogs ([bc57242](https://github.com/ClashStrategic/stats/commit/bc57242882ac30baedd5fcf33562193df85d729b))

# [1.5.0](https://github.com/ClashStrategic/stats/compare/v1.4.1...v1.5.0) (2025-10-28)


### Bug Fixes

* **cards:** correct projectile status for multiple cards ([ff47542](https://github.com/ClashStrategic/stats/commit/ff47542b5254edd4182fa078012590bb3326a765))
* **cards:** update damage and hitpoint values ([71a9141](https://github.com/ClashStrategic/stats/commit/71a914189e2666580d9ad37fc5049bc864cc9d64))
* **cards:** update hitspeed for multiple cards ([ec8c2f4](https://github.com/ClashStrategic/stats/commit/ec8c2f458416d9972b36427fad6665e14a4ff858))
* **cards:** update hitspeed for multiple cards ([e4fe536](https://github.com/ClashStrategic/stats/commit/e4fe5366a66cd89731684bdca1f6503450658fc6))
* **cards:** update mirror card elixir cost ([5aae5a3](https://github.com/ClashStrategic/stats/commit/5aae5a334a42068f91f818e1135586a0cb2babbf))
* **cards:** update multiple card durations ([94e2bab](https://github.com/ClashStrategic/stats/commit/94e2babe502fc434852e31098115762380465f87))
* **cards:** update multiple card evolution stats ([8a53da3](https://github.com/ClashStrategic/stats/commit/8a53da37cab68258dbc9265e40b291f8ee996657))
* **cards:** update various stats for multiple cards ([32810e3](https://github.com/ClashStrategic/stats/commit/32810e338e019a3511fd42b0dbcd414af5fb1e71))


### Features

* **cards:** activate evolution for two card types ([ea6f33c](https://github.com/ClashStrategic/stats/commit/ea6f33cdecde4af7d39ca6b50f2a2fcc6fad7f46))

## [1.4.1](https://github.com/ClashStrategic/stats/compare/v1.4.0...v1.4.1) (2025-09-26)


### Bug Fixes

* **spell-damage:** populate missing damage stats ([71afc3b](https://github.com/ClashStrategic/stats/commit/71afc3b304c72ac9d5c36e27326c927d58d7f895))
* **stats-evo:** correct evolutionary stats for multiple cards ([c55e486](https://github.com/ClashStrategic/stats/commit/c55e486ad071ba7dbba3788ce0971c0a2fc611d2))
* **vines:** populate missing card damage stats ([e997a3f](https://github.com/ClashStrategic/stats/commit/e997a3fa6d60fbdd74097c43c4ecd176051a47a1))

# [1.4.0](https://github.com/ClashStrategic/stats/compare/v1.3.0...v1.4.0) (2025-09-26)


### Bug Fixes

* **elixir-cost:** fix elixir costs for multiple cards ([f11a3a5](https://github.com/ClashStrategic/stats/commit/f11a3a50ec4b365f9953b6e20d9acb7a4fe65ed5))
* **hitspeed:** update hitspeed values for multiple cards ([4667e7a](https://github.com/ClashStrategic/stats/commit/4667e7abd2ef57a00106e789888fcef094ec9659))
* **projectile:** correct projectile property for cards ([b935f20](https://github.com/ClashStrategic/stats/commit/b935f2054f37bf4ce230179de817762c706b6dfa))
* **radius:** set radius values for multiple cards ([31cda18](https://github.com/ClashStrategic/stats/commit/31cda1827ca10881c39b16ef7b4630946709bcce))
* **range:** set range values for cards ([e20a58b](https://github.com/ClashStrategic/stats/commit/e20a58b7530cae627de8bc85326936e6483c9336))
* **rarity:** update rarity for multiple cards ([871149a](https://github.com/ClashStrategic/stats/commit/871149a7cd51abe411439a7fb3d7bc3472b678e9))


### Features

* **baby-dragon-evo:** set evolution and statsEvo values for Baby Dragon ([60bfb08](https://github.com/ClashStrategic/stats/commit/60bfb08fe9b85467ab660decc7617a3ce5f88e65))
* **vines:** add new card Vines ([41f1ba8](https://github.com/ClashStrategic/stats/commit/41f1ba81593b405a19b8f0aa2d98758423a566be))

# [1.3.0](https://github.com/ClashStrategic/stats/compare/v1.2.2...v1.3.0) (2025-09-22)


### Features

* **package:** add main entry point and configure package metadata ([5c63c10](https://github.com/ClashStrategic/stats/commit/5c63c1007ad09f11d49bffbb34915fa7aa7d6310))

## [1.2.2](https://github.com/ClashStrategic/stats/compare/v1.2.1...v1.2.2) (2025-09-19)


### Bug Fixes

* **cards:** correct hitspeed to null for several cards ([3c9d2c7](https://github.com/ClashStrategic/stats/commit/3c9d2c7c76b287e224c914df10ef959e1f27658a))
* **cards:** correct projectile status for multiple cards ([8ddadc9](https://github.com/ClashStrategic/stats/commit/8ddadc94ff2e5823bafc519913fb964f433006fd))
* **cards:** correct target types and nullify typeAttack ([18cb988](https://github.com/ClashStrategic/stats/commit/18cb98834529d96b2e745ddbba335f8c817d5436))

## [1.2.1](https://github.com/ClashStrategic/stats/compare/v1.2.0...v1.2.1) (2025-09-11)


### Bug Fixes

* **cards:** adjust hitspeed, range, and radius values for multiple cards ([57aca5a](https://github.com/ClashStrategic/stats/commit/57aca5a50f987dcaa005802a10da21dd14a9f1ed))
* **cards:** restrict card territory and adjust stats ([c900b9c](https://github.com/ClashStrategic/stats/commit/c900b9c50e5e76b3a87f107d2eecf30aa2d5e2a4))
* **cards:** update card targets to include ground units ([a466486](https://github.com/ClashStrategic/stats/commit/a466486333c4358288c68f64cbdd61dd687de90b))

# [1.2.0](https://github.com/ClashStrategic/stats/compare/v1.1.3...v1.2.0) (2025-09-02)


### Bug Fixes

* **cards:** correct hitpoints and damage values across multiple cards ([7a5b091](https://github.com/ClashStrategic/stats/commit/7a5b091acc1a19d3c25b2d7037a40e8d3a1f7200))


### Features

* **balance-changes:** update cards, hitspeed and damage values for multiple cards ([f58b805](https://github.com/ClashStrategic/stats/commit/f58b805d63e5b3628ddbd568a0b033d5c5ca80a8))
* **furnace-evo:** correct card type from building to troop and enable evolution ([e7f9b46](https://github.com/ClashStrategic/stats/commit/e7f9b464b2a89ac0db17c590fac23f595645beb6))

## [1.1.3](https://github.com/ClashStrategic/stats/compare/v1.1.2...v1.1.3) (2025-08-15)


### Bug Fixes

* **cards:** correct card type and hitspeed values ([84ad30d](https://github.com/ClashStrategic/stats/commit/84ad30d300f8dcfa12c5afd8cdcdc44870e7b8b2))
* **spells:** adjust targeting properties ([b8d7eaa](https://github.com/ClashStrategic/stats/commit/b8d7eaa54929be755656d7c2633a8e7aab69d46f))

## [1.1.2](https://github.com/ClashStrategic/stats/compare/v1.1.1...v1.1.2) (2025-07-30)


### Bug Fixes

* **cards:** standardize and correct card targets ([e9da8e1](https://github.com/ClashStrategic/stats/commit/e9da8e1960d6e2756a8aa74f9a675d1126f8a98a))
* **spell-cards:** update targets to ground only ([0f1ed25](https://github.com/ClashStrategic/stats/commit/0f1ed254bb8d90879b0e323dbf2c8017ff318a4b))

## [1.1.1](https://github.com/ClashStrategic/stats/compare/v1.1.0...v1.1.1) (2025-07-15)


### Bug Fixes

* **building-cards:** Update building card stats for balance changes ([1044c3e](https://github.com/ClashStrategic/stats/commit/1044c3e79c643453ce36266817143e1883d6144d))
* **spell-cards:** update spell card stats for balance changes ([03867a9](https://github.com/ClashStrategic/stats/commit/03867a95ef2ee07e8e6d30721baf00564ee043a5))
* **tower-cards:** update tower card stats for balance changes ([c74a171](https://github.com/ClashStrategic/stats/commit/c74a1714314fe08d65b9340d297401e8ff0696a7))
* **troop-cards:** Update troop card stats for balance changes ([f8fb2a2](https://github.com/ClashStrategic/stats/commit/f8fb2a2842c01287eaa85f76f4264ae7492ccec0))

# [1.1.0](https://github.com/ClashStrategic/stats/compare/v1.0.0...v1.1.0) (2025-07-09)


### Bug Fixes

* **cards:** capitalize 'The Log' card name ([587f47d](https://github.com/ClashStrategic/stats/commit/587f47db8ed09808f21ec2f86a3e59332ad65cc0))


### Features

* **cards:** add Spirit Empress card data ([f330bb3](https://github.com/ClashStrategic/stats/commit/f330bb3b0387b1e0b470ffde75dc192b5356d14a))
* **Inferno Dragon:** Enable Inferno Dragon evolution and define stats ([30ed44c](https://github.com/ClashStrategic/stats/commit/30ed44c91fab26d6cd14d9ced2fc4f6c539318a3))
* **Skeleton Barrel:** Enable Skeleton Barrel evolution and define stats ([9045999](https://github.com/ClashStrategic/stats/commit/9045999cef0a452a3c713821a1047de99bd6fb44))
* **Witch:** Enable Witch evolution and define stats ([acba5e5](https://github.com/ClashStrategic/stats/commit/acba5e5ac8520c8a4fdbc406432033843206bb10))

# [1.0.0](https://github.com/ClashStrategic/stats/compare/v0.1.4...v1.0.0) (2025-07-07)


### Bug Fixes

* **cards:** correct 'proyectil' spelling to 'projectile' ([af7042e](https://github.com/ClashStrategic/stats/commit/af7042e462d93312324b52181398a5b4fafb9573))
* **cards:** standardize numeric fields to floats ([4701967](https://github.com/ClashStrategic/stats/commit/470196714591697e105417d3f1cad3388f46c211))


### Code Refactoring

* **cards:** normalize card property string values ([1edceba](https://github.com/ClashStrategic/stats/commit/1edceba3e50c264610f5bc83455e8089b165fd5b))
* **cards:** remove redundant dps field ([1257115](https://github.com/ClashStrategic/stats/commit/12571159ef643f53a70c4326d2a0b2957a0d41ef))
* **cards:** rename 'Attack' property to 'targets' ([8dd5511](https://github.com/ClashStrategic/stats/commit/8dd5511eade69f2c2dd8cecaff5f715d0995e59e))
* **cards:** standardize card targets to ground/air ([297a560](https://github.com/ClashStrategic/stats/commit/297a5600e062839134c84cc38a7f6b16e8f109e4))
* **cards:** standardize data keys to camelCase ([b81377b](https://github.com/ClashStrategic/stats/commit/b81377bc0cd0ff4a040df1535f02239eed25eeb2))
* **cards:** standardize target type values ([7cd5d69](https://github.com/ClashStrategic/stats/commit/7cd5d691d80696e39b4e6693800eb5a1a981c986))


### BREAKING CHANGES

* **cards:** Removed the 'dps' attribute from all card entries. This metric is inherently calculable from the 'damage' and 'hitspeed' properties. Eliminating its storage reduces the overall data footprint and enforces a consistent computation model for derived statistics.
* **cards:** Standardizes 'speed', 'territory', 'rarity', and 'type' fields to use
lowercase or kebab-case for consistency across the dataset.
* **cards:** Corrected/Modified the spelling of the 'proyectil' key to 'projectile' across all card entries in cards.json. This ensures data consistency and accuracy.
* **cards:** All property names starting with an uppercase letter are changed to lowercase, updating access to these properties
* **cards:** The "hechX" values ​​are removed from all spells and are replaced by "ground" & "air", now to identify a spell type you must analyze its "elixirCost", damage, etc.
* **cards:** The old values 'ter', 'aer', and 'est' ​​must be replaced with the new values
* **cards:** The 'Attack' property in card data has been renamed to 'targets'. Consumers of card data must update their code to use the new property name.

## [0.1.4](https://github.com/ClashStrategic/stats/compare/v0.1.3...v0.1.4) (2025-07-06)


### Bug Fixes

* **DeploymentTime:** remove inconsistent DeploymentTime attribute ([e5f6837](https://github.com/ClashStrategic/stats/commit/e5f68376e30696c46ba50f24b819742986bd42ea))

## [0.1.3](https://github.com/ClashStrategic/stats/compare/v0.1.2...v0.1.3) (2025-07-06)


### Bug Fixes

* **data:** normalize boolean false to null for card attributes ([478b6ca](https://github.com/ClashStrategic/stats/commit/478b6ca91317babb73ac575f5866839d1dc93eef))
* **radio:** Removes the inconsistent "radio" attribute from the "Royal Giant" card. ([66b772d](https://github.com/ClashStrategic/stats/commit/66b772d9579d5a99740878b4b87a1c809434a48d))
* **range:** normalize range attribute to null for melee cards ([ef2be60](https://github.com/ClashStrategic/stats/commit/ef2be604742bb757977cae0097531aa97a55eb2b))
* **TypeAttack:** resolve inconsistent TypeAttack boolean values ([657d2ed](https://github.com/ClashStrategic/stats/commit/657d2edea0944b22126be53f8dff36cf67dc13c9))

## [0.1.2](https://github.com/ClashStrategic/stats/compare/v0.1.1...v0.1.2) (2025-07-03)


### Bug Fixes

* **cards:** Removes unprepared special data of the normal and evolution types from the charts. ([75a0c94](https://github.com/ClashStrategic/stats/commit/75a0c940d02f5f3a0dde77f949449c5cbeaec529))

## [0.1.1](https://github.com/ClashStrategic/stats/compare/v0.1.0...v0.1.1) (2025-07-03)


### Bug Fixes

* **cards:** Integrates the missing "ChargeDamage" data into the cards with their false value. ([b03e46a](https://github.com/ClashStrategic/stats/commit/b03e46a7dba5e9771b25e01effbd50e32c2a5368))
