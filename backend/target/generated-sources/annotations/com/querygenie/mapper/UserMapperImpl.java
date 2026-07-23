package com.querygenie.mapper;

import com.querygenie.dto.AuthResponse;
import com.querygenie.dto.RegisterRequest;
import com.querygenie.entity.User;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-07-23T00:34:45+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.16 (Oracle Corporation)"
)
@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public User toEntity(RegisterRequest request) {
        if ( request == null ) {
            return null;
        }

        User.UserBuilder user = User.builder();

        user.name( request.getName() );
        user.email( request.getEmail() );
        user.role( request.getRole() );

        return user.build();
    }

    @Override
    public AuthResponse toAuthResponse(User user) {
        if ( user == null ) {
            return null;
        }

        AuthResponse.AuthResponseBuilder authResponse = AuthResponse.builder();

        authResponse.userId( user.getId() );
        authResponse.name( user.getName() );
        authResponse.email( user.getEmail() );
        authResponse.role( user.getRole() );

        authResponse.tokenType( "Bearer" );

        return authResponse.build();
    }
}
