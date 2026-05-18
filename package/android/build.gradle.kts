buildscript {
  val module by extra(
    mapOf(
      "kotlinVersion" to "2.0.21",
      "minSdkVersion" to 26, // Android 8 at minimum is required for Netty
      "compileSdkVersion" to 36,
      "targetSdkVersion" to 36,
    )
  )

  val getExtOrDefault by extra {
    { name: String ->
      if(rootProject.extra.has(name)) {
        rootProject.extra[name]!!
      } else {
        module[name]!!
      }
    }
  }

  repositories {
    google()
    mavenCentral()
  }

  dependencies {
    classpath("com.android.tools.build:gradle:8.7.2")

    // noinspection DifferentKotlinGradleVersion
    classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:${getExtOrDefault("kotlinVersion")}")
  }
}

plugins {
  id("com.android.library")
  id("org.jetbrains.kotlin.android")

  id("com.facebook.react")
}

android {
  val getExtOrDefault = extra["getExtOrDefault"] as (String) -> Any

  namespace = "id.sufeni.oss.reactnativeecho"

  compileSdk = getExtOrDefault("compileSdkVersion") as Int

  defaultConfig {
    minSdk = getExtOrDefault("minSdkVersion") as Int

    // https://issuetracker.google.com/issues/230625468?pli=1
    // It is not useful for libraries to declare a targetSdkVersion and soon the manifest merger will ignore it.
    // targetSdk = getExtOrDefault("targetSdkVersion") as Int

    externalNativeBuild {
      cmake {
        arguments += listOf("-DANDROID_STL=c++_shared")
      }
    }
  }

  externalNativeBuild {
    cmake {
      path("CMakeLists.txt")
    }
  }

  packaging {
    resources {
      excludes.add("META-INF/INDEX.LIST")
    }
  }

  buildFeatures {
    buildConfig = true
    prefab = true
    prefabPublishing = true
  }

  buildTypes {
    release {
      isMinifyEnabled = false
    }
  }

  lint {
    disable += "GradleCompatible"
    targetSdk = getExtOrDefault("targetSdkVersion") as Int
  }

  compileOptions {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
  }
}

dependencies {
  val getExtOrDefault = project.extra["getExtOrDefault"] as (String) -> Any
  val kotlinVersion = getExtOrDefault("kotlinVersion") as String

  implementation("com.facebook.react:react-android")
  implementation("org.jetbrains.kotlin:kotlin-stdlib:$kotlinVersion")

  // +++++ ktor +++++
  /**
   * Read this from Kotlin evolution principles
   * ```
   * Preferably (but we can't guarantee it),
   * the binary format is mostly forwards compatible with the next language release,
   * but not later ones (in the cases when new features are not used,
   * for example, 1.9 can understand most binaries from 2.0, but not 2.1).
   * ```
   * @see <a href="https://kotlinlang.org/docs/kotlin-evolution-principles.html#compatibility-options">Compatibility Options</a>
   * @see <a href="https://docs.gradle.org/current/userguide/dependency_versions.html#sec:single-version-declarations">Understanding version declaration</a>
   * @see <a href="https://ktor.io/docs/releases.html#release-details">Ktor releases</a>
   */
  val mapKotlinToKtorVersion by extra {
    mapOf(
      "2.0" to "[3.1.3, 3.2.3]",  // Ktor 3.1.3 - 3.2.3   [actual Kotlin = 2.1]
      "2.1" to "[3.3.0, 3.3.3]",  // Ktor 3.3.0 - 3.3.3   [actual Kotlin = 2.2]
      "2.2" to "3.4.+",           // Ktor 3.4.+           [actual Kotlin = 2.3]
    )
  }

  fun getKtorVersion(kotlinVersion: String): String {
    val semver = kotlinVersion.split(".")
    val major = semver[0]
    val minor = semver[1]

    var ktorVersion = mapKotlinToKtorVersion["${major}.${minor}"]

    if (ktorVersion == null) {
      val kotlinToKtorVersionLastEntry = mapKotlinToKtorVersion.entries.last()
      ktorVersion = kotlinToKtorVersionLastEntry.value

      logger.warn(
        """
          :: react-native-echo ::
          For future readers, this library is not updated since React Native was using Kotlin ${kotlinToKtorVersionLastEntry.key}.
          Please, help this library to update the map of Kotlin version to compatible Ktor version.
          
          Resolved to Ktor $ktorVersion
        """.trimIndent()
      )
    } else {
      logger.lifecycle(
        """
          :: react-native-echo ::
          Resolved to Ktor $ktorVersion because of Kotlin $kotlinVersion
        """.trimIndent()
      )
    }

    return ktorVersion
  }

  val ktorVersion = getKtorVersion(kotlinVersion)

  implementation("io.ktor:ktor-server-core:$ktorVersion")
  implementation("io.ktor:ktor-server-netty:$ktorVersion")

  implementation("io.ktor:ktor-network-tls-certificates:${ktorVersion}") // https
  implementation("io.ktor:ktor-server-forwarded-header:$ktorVersion") // request origin
  // Try to serialize a text to JSON in JavaScript side.
  // implementation("io.ktor:ktor-serialization-gson:$ktorVersion")
  // implementation("io.ktor:ktor-server-content-negotation:$ktorVersion")
  // ----- ktor -----
}
