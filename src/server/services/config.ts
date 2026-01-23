import { Config, Effect, Layer, Context } from "effect";

// ============================================================================
// Typed Errors
// ============================================================================

export class ConfigError {
	readonly _tag = "ConfigError";
	constructor(readonly message: string) {}
}

// ============================================================================
// Config Schema using Effect Config
// ============================================================================

const databaseConfig = Config.all({
	url: Config.string("DATABASE_URL"),
});

const authConfig = Config.all({
	secret: Config.string("AUTH_SECRET").pipe(
		Config.withDefault("development-secret"),
	),
});

const appConfig = Config.all({
	nodeEnv: Config.string("NODE_ENV").pipe(Config.withDefault("development")),
});

// ============================================================================
// Combined App Configuration
// ============================================================================

export const AppConfig = Config.all({
	database: databaseConfig,
	auth: authConfig,
	app: appConfig,
});

export type AppConfigType = Config.Config.Success<typeof AppConfig>;

// ============================================================================
// Config Service Definition
// ============================================================================

export class ConfigService extends Context.Tag("ConfigService")<
	ConfigService,
	{
		readonly getConfig: () => Effect.Effect<AppConfigType, ConfigError>;
		readonly getDatabaseUrl: () => Effect.Effect<string, ConfigError>;
		readonly isProduction: () => Effect.Effect<boolean, ConfigError>;
	}
>() {}

// ============================================================================
// Live Implementation
// ============================================================================

export const ConfigServiceLive = Layer.succeed(ConfigService, {
	getConfig: () =>
		AppConfig.pipe(
			Effect.mapError((error) => new ConfigError(`Config error: ${error}`)),
		),

	getDatabaseUrl: () =>
		Config.string("DATABASE_URL").pipe(
			Effect.mapError((error) => new ConfigError(`DATABASE_URL not set: ${error}`)),
		),

	isProduction: () =>
		Config.string("NODE_ENV").pipe(
			Config.withDefault("development"),
			Effect.map((env) => env === "production"),
			Effect.mapError((error) => new ConfigError(`NODE_ENV error: ${error}`)),
		),
});

// ============================================================================
// Helper to load config at startup
// ============================================================================

export const loadConfig = () =>
	Effect.gen(function* () {
		const config = yield* AppConfig;
		yield* Effect.log(`Config loaded: ${config.app.nodeEnv} environment`);
		return config;
	}).pipe(
		Effect.mapError((error) => new ConfigError(`Failed to load config: ${error}`)),
	);

// ============================================================================
// Validate config (useful for startup checks)
// ============================================================================

export const validateConfig = () =>
	Effect.gen(function* () {
		const config = yield* loadConfig();

		// Validate required fields in production
		if (config.app.nodeEnv === "production") {
			if (config.auth.secret === "development-secret") {
				return yield* Effect.fail(
					new ConfigError("AUTH_SECRET must be set in production"),
				);
			}
		}

		yield* Effect.log("Config validation passed");
		return config;
	});
