from dataclasses import dataclass


@dataclass(frozen=True)
class APIRouteNames:
    HEALTH = "health::ping"
    VOYAGER = "agent::voyager"
    WEB_RESEARCHER = "agent::web_researcher"
    SEO_ADVISOR = "agent::seo_advisor"
