import React, { useState, useContext } from 'react'
import Input from '../../shared/components/FormElements/Input'
import { VALIDATOR_EMAIL, VALIDATOR_MAXLENGTH, VALIDATOR_MINLENGTH, VALIDATOR_REQUIRE } from '../../shared/util/validators'
import { useForm } from '../../shared/hooks/form-hook';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner'
import Card from '../../shared/components/UIElements/Card';
import { AuthContext } from '../../shared/context/auth-context';
import ImageUpload from '../../shared/components/FormElements/ImageUpload';
import { useHttpClient } from '../../shared/hooks/http-hook';

import './Auth.css'

const Auth = () => {

    const auth = useContext(AuthContext);

    const [isLoginMode, setIsLoginMode] = useState(true);
    const { isLoading, sendRequest, error, clearError } = useHttpClient();

    const [formState, inputHandler, setFormData] = useForm(
        {
            email: {
                value: '',
                isValid: false
            }
        },
        false
    );

    const loginSubmitHandler = async event => {
        event.preventDefault();



        if (isLoginMode) {
            try {
                const responseData = await sendRequest(process.env.REACT_APP_BACKEND_URL + '/users/login', 'POST',
                    JSON.stringify({
                        email: formState.inputs.email.value,
                        password: formState.inputs.password.value
                    }),
                    { 'Content-Type': 'application/json' }
                );

                auth.login(responseData.userId, responseData.token);
            } catch (err) {

            }

        } else {
            try {

                const formData = new FormData();
                formData.append('email', formState.inputs.email.value);
                formData.append('name', formState.inputs.name.value);
                formData.append('password', formState.inputs.password.value);
                formData.append('image', formState.inputs.image.value);

                const responseData = await sendRequest(
                    process.env.REACT_APP_BACKEND_URL + '/users/signup',
                    'POST',
                    formData


                );
                auth.login(responseData.userId, responseData.token);
            } catch (err) { }
        }
    };

    const switchModeHandler = () => {
        if (!isLoginMode) {
            setFormData(
                {
                    ...formState.inputs,
                    name: undefined,
                    image: undefined
                },
                formState.inputs.email.isValid && formState.inputs.password.isValid
            );
        }
        else {
            setFormData({
                ...formState.inputs,
                name: {
                    value: "",
                    isValid: false
                },
                image: {
                    value: null,
                    isValid: false
                }
            }, false);
        }
        setIsLoginMode(prevMode => !prevMode);
    };

    return (
        <React.Fragment>

            <ErrorModal error={error} onClear={clearError} />
            <Card className="authentication">
                {isLoading && <LoadingSpinner asOverlay />}
                <h2>Login Required</h2>
                <hr />
                <form onSubmit={loginSubmitHandler}>
                    {!isLoginMode && <Input
                        id="name"
                        element="input"
                        type="text"
                        label="Your Name"
                        validators={[VALIDATOR_REQUIRE()]}
                        errorText="Please enter a name."
                        onInput={inputHandler}

                    />}
                    {!isLoginMode && <ImageUpload center id="image" onInput={inputHandler} errorText="Please provide an image." />}
                    <Input
                        id="email"
                        element="input"
                        type="email"
                        label="E-mail"
                        validators={[VALIDATOR_EMAIL()]}
                        errorText="Please enter a valid Email."
                        onInput={inputHandler}
                    ></Input>
                    <Input
                        id="password"
                        element="input"
                        type="password"
                        label="Password"
                        validators={[VALIDATOR_MINLENGTH(6), VALIDATOR_MAXLENGTH(8)]}
                        errorText="Password length must be in between 6 to 8."
                        onInput={inputHandler}
                    ></Input>
                    <Button type="submit" disabled={!formState.isValid}>
                        {isLoginMode ? 'LOGIN' : 'SIGNUP'}
                    </Button>
                </form>
                <Button inverse onClick={switchModeHandler}>SWITCH TO {!isLoginMode ? 'LOGIN' : 'SIGNUP'}</Button>
            </Card>
        </React.Fragment>
    )
}

export default Auth