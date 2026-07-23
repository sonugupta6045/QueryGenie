package com.querygenie.security;

import com.querygenie.entity.ApiConsumer;
import lombok.Getter;

/**
 * Principal object placed in the SecurityContext for API Consumer requests.
 * Carries the ApiConsumer entity so the service layer can extract the scoped data_source_id.
 */
@Getter
public class ApiConsumerPrincipal {

    private final ApiConsumer apiConsumer;

    public ApiConsumerPrincipal(ApiConsumer apiConsumer) {
        this.apiConsumer = apiConsumer;
    }

    @Override
    public String toString() {
        return "ApiConsumer[" + apiConsumer.getId() + "]";
    }
}
