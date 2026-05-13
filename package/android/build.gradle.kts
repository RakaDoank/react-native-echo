buildscript {
  val module by extra(
    mapOf(
      "kotlinVersion" to "2.0.21",
      "minSdkVersion" to 24,
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
  kotlin("android")

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
  }

  lint {
    targetSdk = getExtOrDefault("targetSdkVersion") as Int
  }

  buildFeatures {
    buildConfig = true
  }

  buildTypes {
    release {
      isMinifyEnabled = false
    }
  }

  lint {
    disable += "GradleCompatible"
  }

  compileOptions {
    sourceCompatibility = JavaVersion.VERSION_1_8
    targetCompatibility = JavaVersion.VERSION_1_8
  }
}

dependencies {
  implementation("com.facebook.react:react-android")

  // +++++ ktor +++++
  val ktorVersion = "3.4.3"

  implementation("io.ktor:ktor-server-core:$ktorVersion")
  implementation("io.ktor:ktor-server-netty:$ktorVersion")

  implementation("io.ktor:ktor-network-tls-certificates:${ktorVersion}") // https
  implementation("io.ktor:ktor-server-forwarded-header:$ktorVersion") // request origin
  // Try to serialize a text to JSON in JavaScript side.
  // implementation("io.ktor:ktor-serialization-gson:$ktorVersion")
  // implementation("io.ktor:ktor-server-content-negotation:$ktorVersion")
  // ----- ktor -----
}
