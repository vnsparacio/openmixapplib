
(function() {
    'use strict';

    var default_settings = {
        providers: [
            'foo',
            'bar',
            'baz'
        ],
        geo_order: ['state', 'region', 'country', 'market'],
        use_radar_availability_threshold: true,
        use_sonar_availability_threshold: true,
        geo_settings: {
            'CN': { //Example of China Settings.
                type: 'country', // Can be 'market', 'country', 'region', 'state'.
                providers: {
                    'foo': {
                        cname: 'cn.foo.net',
                        kbps_padding: 5,
                        rtt_padding: 10
                    },
                    'baz': {
                        cname: 'cn.baz.net',
                        kbps_padding: 5,
                        rtt_padding: 10
                    }
                },
                default_ttl: 240,
                radar_availability_threshold: 90,
                rtt_tp_mix: 0.60
            },
            'US-S-AR': { // Example of Arizona Settings.
                type: 'state',
                providers: {
                    'foo': {
                        cname: 'az.foo.net',
                        kbps_padding: 5,
                        rtt_padding: 10
                    },
                    'baz': {
                        cname: 'az.baz.net',
                        kbps_padding: 5,
                        rtt_padding: 10
                    }
                },
                default_ttl: 20,
                radar_availability_threshold: 80,
                rtt_tp_mix: 0.05
            },
            'a1': {
                type: 'state',
                providers: {
                    'foo': {
                        cname: 'az.foo.net',
                        kbps_padding: 5,
                        rtt_padding: 10
                    },
                    'baz': {
                        cname: 'az.baz.net',
                        kbps_padding: 5,
                        rtt_padding: 10
                    }
                },
                default_ttl: 20,
                radar_availability_threshold: 80,
                rtt_tp_mix: 0.05
            },
            'b1': {
                type: 'region',
                providers: {
                    'foo': {
                        cname: 'az.foo.net',
                        kbps_padding: 5,
                        rtt_padding: 10
                    },
                    'baz': {
                        cname: 'az.baz.net',
                        kbps_padding: 5,
                        rtt_padding: 10
                    }
                },
                default_ttl: 20,
                radar_availability_threshold: 80,
                rtt_tp_mix: 0.05
            },
            'c1': {
                type: 'country',
                providers: {
                    'foo': {
                        cname: 'az.foo.net',
                        kbps_padding: 5,
                        rtt_padding: 10
                    },
                    'baz': {
                        cname: 'az.baz.net',
                        kbps_padding: 5,
                        rtt_padding: 10
                    }
                },
                default_ttl: 20,
                radar_availability_threshold: 80,
                rtt_tp_mix: 0.05
            },
            'd1': {
                type: 'market',
                providers: {
                    'foo': {
                        cname: 'az.foo.net',
                        kbps_padding: 5,
                        rtt_padding: 10
                    },
                    'baz': {
                        cname: 'az.baz.net',
                        kbps_padding: 5,
                        rtt_padding: 10
                    }
                },
                default_ttl: 20,
                radar_availability_threshold: 80,
                rtt_tp_mix: 0.05
            }
        },
        default_settings: {
            providers: {
                'foo': {
                    cname: 'cn.foo.net',
                    kbps_padding: 0,
                    rtt_padding: 0
                },
                'bar': {
                    cname: 'cn.bar.net',
                    kbps_padding: 0,
                    rtt_padding: 0
                }
            },
            default_ttl: 240,
            radar_availability_threshold: 95,
            sonar_availability_threshold: 2,
            min_rtt: 5,
            rtt_tp_mix: 0.95
        },
        asn_overrides: {
            1234: 'bar'
        }
    };

    module('do_init');

    function test_do_init(i) {
        return function() {

            var sut = new OpenmixApplication(i.settings || default_settings),
                config = {
                    requireProvider: this.stub()
                },
                test_stuff = {
                    instance: sut,
                    config: config
                };

            i.setup(test_stuff);

            // Test
            sut.do_init(config);

            // Assert
            i.verify(test_stuff);
        };
    }

    test('default', test_do_init({
        setup: function() { return; },
        verify: function(i) {
            equal(i.config.requireProvider.callCount, 3, 'Verifying requireProvider call count');
            equal(i.config.requireProvider.args[2][0], 'foo', 'Verirying failover provider alias');
            equal(i.config.requireProvider.args[1][0], 'bar', 'Verirying provider alias');
            equal(i.config.requireProvider.args[0][0], 'baz', 'Verirying provider alias');
        }
    }));

    module('handle_request');

    function test_handle_request(i) {
        return function() {
            var sut = new OpenmixApplication(i.settings || default_settings),
                request = {
                    getData: this.stub(),
                    getProbe: this.stub()
                },
                response = {
                    respond: this.stub(),
                    setTTL: this.stub(),
                    setReasonCode: this.stub()
                },
                test_stuff = {
                    instance: sut,
                    request: request,
                    response: response
                };

            this.stub(Math,"random");

            i.setup(test_stuff);

            // Test
            sut.handle_request(request, response);

            // Assert
            i.verify(test_stuff);
        };
    }

    test('test 1 optimum_server_chosen', test_handle_request({
        setup: function(i) {
            i.request
                .getProbe
                .withArgs('avail')
                .returns({
                    'foo': { avail: 100 },
                    'bar': { avail: 100 },
                    'baz': { avail: 100 }
                });
            i.request
                .getProbe
                .withArgs('http_rtt')
                .returns({
                    'foo': { http_rtt: 60 },
                    'bar': { http_rtt: 85 },
                    'baz': { http_rtt: 90 }
                });
            i.request
                .getProbe
                .withArgs('http_kbps')
                .returns({
                    'foo': { http_kbps: 60 },
                    'bar': { http_kbps: 85 },
                    'baz': { http_kbps: 90 }
                });
            i.request
                .getData
                .withArgs('fusion')
                .returns({
                    "foo": JSON.stringify({
                        "status": "HTTP server is functioning normally",
                        "state": "OK",
                        "health_score": {
                            "unit": "0-5",
                            "value": 5
                        },
                        "bypass_data_points": true
                    }),
                    "bar": JSON.stringify({
                        "status": "HTTP server is functioning normally",
                        "state": "OK",
                        "health_score": {
                            "unit": "0-5",
                            "value": 5
                        },
                        "bypass_data_points": true
                    }),
                    "baz": JSON.stringify({
                        "status": "HTTP server is functioning normally",
                        "state": "OK",
                        "health_score": {
                            "unit": "0-5",
                            "value": 5
                        },
                        "bypass_data_points": true
                    })
                });
            Math.random.returns(0.9);
            i.request.asn = 123;
            i.request.state = 'a';
            i.request.region = 'b';
            i.request.country = 'c';
            i.request.market = 'd';
        },
        verify: function(i) {
            equal(i.request.getProbe.callCount, 3, 'Verifying getData call count');
            equal(i.request.getData.callCount, 1, 'Verifying getData call count');
            equal(i.response.respond.callCount, 1, 'Verifying respond call count');
            equal(i.response.setTTL.callCount, 1, 'Verifying setTTL call count');
            equal(i.response.setReasonCode.callCount, 1, 'Verifying setReasonCode call count');

            equal(i.response.respond.args[0][0], 'bar', 'Verifying respond provider');
            equal(i.response.respond.args[0][1], 'cn.bar.net', 'Verifying respond CNAME');
            equal(i.response.setTTL.args[0][0], 240, 'Verifying setTTL');
            equal(i.response.setReasonCode.args[0][0], 'I,A', 'Verifying setReasonCode');
        }
    }));

    test('test 2 geo_override_on_state', test_handle_request({
        setup: function(i) {
            i.request
                .getProbe
                .withArgs('avail')
                .returns({
                    'foo': { avail: 100 },
                    'bar': { avail: 100 },
                    'baz': { avail: 100 }
                });
            i.request
                .getProbe
                .withArgs('http_rtt')
                .returns({
                    'foo': { http_rtt: 60 },
                    'bar': { http_rtt: 85 },
                    'baz': { http_rtt: 90 }
                });
            i.request
                .getProbe
                .withArgs('http_kbps')
                .returns({
                    'foo': { http_kbps: 60 },
                    'bar': { http_kbps: 85 },
                    'baz': { http_kbps: 90 }
                });
            i.request
                .getData
                .withArgs('fusion')
                .returns({
                    "foo": JSON.stringify({
                        "status": "HTTP server is functioning normally",
                        "state": "OK",
                        "health_score": {
                            "unit": "0-5",
                            "value": 5
                        },
                        "bypass_data_points": true
                    }),
                    "bar": JSON.stringify({
                        "status": "HTTP server is functioning normally",
                        "state": "OK",
                        "health_score": {
                            "unit": "0-5",
                            "value": 5
                        },
                        "bypass_data_points": true
                    }),
                    "baz": JSON.stringify({
                        "status": "HTTP server is functioning normally",
                        "state": "OK",
                        "health_score": {
                            "unit": "0-5",
                            "value": 5
                        },
                        "bypass_data_points": true
                    })
                });
            Math.random.returns(0.9);
            i.request.asn = 123;
            i.request.state = 'a1';
            i.request.region = 'b';
            i.request.country = 'c';
            i.request.market = 'd';
        },
        verify: function(i) {
            equal(i.request.getData.callCount, 1, 'Verifying getData call count');
            equal(i.response.respond.callCount, 1, 'Verifying respond call count');
            equal(i.response.setTTL.callCount, 1, 'Verifying setTTL call count');
            equal(i.response.setReasonCode.callCount, 1, 'Verifying setReasonCode call count');

            equal(i.response.respond.args[0][0], 'foo', 'Verifying respond provider');
            equal(i.response.respond.args[0][1], 'az.foo.net', 'Verifying respond CNAME');
            equal(i.response.setTTL.args[0][0], 20, 'Verifying setTTL');
            equal(i.response.setReasonCode.args[0][0], 'B,A', 'Verifying setReasonCode');
        }
    }));

    test('test 3 geo_override_on_region', test_handle_request({
        setup: function(i) {
            i.request
                .getProbe
                .withArgs('avail')
                .returns({
                    'foo': { avail: 100 },
                    'bar': { avail: 100 },
                    'baz': { avail: 100 }
                });
            i.request
                .getProbe
                .withArgs('http_rtt')
                .returns({
                    'foo': { http_rtt: 60 },
                    'bar': { http_rtt: 85 },
                    'baz': { http_rtt: 90 }
                });
            i.request
                .getProbe
                .withArgs('http_kbps')
                .returns({
                    'foo': { http_kbps: 60 },
                    'bar': { http_kbps: 85 },
                    'baz': { http_kbps: 90 }
                });
            i.request
                .getData
                .withArgs('fusion')
                .returns({
                    "foo": JSON.stringify({
                        "status": "HTTP server is functioning normally",
                        "state": "OK",
                        "health_score": {
                            "unit": "0-5",
                            "value": 5
                        },
                        "bypass_data_points": true
                    }),
                    "bar": JSON.stringify({
                        "status": "HTTP server is functioning normally",
                        "state": "OK",
                        "health_score": {
                            "unit": "0-5",
                            "value": 5
                        },
                        "bypass_data_points": true
                    }),
                    "baz": JSON.stringify({
                        "status": "HTTP server is functioning normally",
                        "state": "OK",
                        "health_score": {
                            "unit": "0-5",
                            "value": 5
                        },
                        "bypass_data_points": true
                    })
                });
            Math.random.returns(0.9);
            i.request.asn = 123;
            i.request.state = 'a';
            i.request.region = 'b1';
            i.request.country = 'c';
            i.request.market = 'd';
        },
        verify: function(i) {
            equal(i.request.getData.callCount, 1, 'Verifying getData call count');
            equal(i.response.respond.callCount, 1, 'Verifying respond call count');
            equal(i.response.setTTL.callCount, 1, 'Verifying setTTL call count');
            equal(i.response.setReasonCode.callCount, 1, 'Verifying setReasonCode call count');

            equal(i.response.respond.args[0][0], 'foo', 'Verifying respond provider');
            equal(i.response.respond.args[0][1], 'az.foo.net', 'Verifying respond CNAME');
            equal(i.response.setTTL.args[0][0], 20, 'Verifying setTTL');
            equal(i.response.setReasonCode.args[0][0], 'C,A', 'Verifying setReasonCode');
        }
    }));

    test('test 4 geo_override_on_country', test_handle_request({
        setup: function(i) {
            i.request
                .getProbe
                .withArgs('avail')
                .returns({
                    'foo': { avail: 100 },
                    'bar': { avail: 100 },
                    'baz': { avail: 100 }
                });
            i.request
                .getProbe
                .withArgs('http_rtt')
                .returns({
                    'foo': { http_rtt: 60 },
                    'bar': { http_rtt: 85 },
                    'baz': { http_rtt: 90 }
                });
            i.request
                .getProbe
                .withArgs('http_kbps')
                .returns({
                    'foo': { http_kbps: 60 },
                    'bar': { http_kbps: 85 },
                    'baz': { http_kbps: 90 }
                });
            i.request
                .getData
                .withArgs('fusion')
                .returns({
                    "foo": JSON.stringify({
                        "status": "HTTP server is functioning normally",
                        "state": "OK",
                        "health_score": {
                            "unit": "0-5",
                            "value": 5
                        },
                        "bypass_data_points": true
                    }),
                    "bar": JSON.stringify({
                        "status": "HTTP server is functioning normally",
                        "state": "OK",
                        "health_score": {
                            "unit": "0-5",
                            "value": 5
                        },
                        "bypass_data_points": true
                    }),
                    "baz": JSON.stringify({
                        "status": "HTTP server is functioning normally",
                        "state": "OK",
                        "health_score": {
                            "unit": "0-5",
                            "value": 5
                        },
                        "bypass_data_points": true
                    })
                });
            Math.random.returns(0.9);
            i.request.asn = 123;
            i.request.state = 'a';
            i.request.region = 'b';
            i.request.country = 'c1';
            i.request.market = 'd';
        },
        verify: function(i) {
            equal(i.request.getData.callCount, 1, 'Verifying getData call count');
            equal(i.response.respond.callCount, 1, 'Verifying respond call count');
            equal(i.response.setTTL.callCount, 1, 'Verifying setTTL call count');
            equal(i.response.setReasonCode.callCount, 1, 'Verifying setReasonCode call count');

            equal(i.response.respond.args[0][0], 'foo', 'Verifying respond provider');
            equal(i.response.respond.args[0][1], 'az.foo.net', 'Verifying respond CNAME');
            equal(i.response.setTTL.args[0][0], 20, 'Verifying setTTL');
            equal(i.response.setReasonCode.args[0][0], 'D,A', 'Verifying setReasonCode');
        }
    }));

    test('test 5 geo_override_on_market', test_handle_request({
        setup: function(i) {
            i.request
                .getProbe
                .withArgs('avail')
                .returns({
                    'foo': { avail: 100 },
                    'bar': { avail: 100 },
                    'baz': { avail: 100 }
                });
            i.request
                .getProbe
                .withArgs('http_rtt')
                .returns({
                    'foo': { http_rtt: 60 },
                    'bar': { http_rtt: 85 },
                    'baz': { http_rtt: 90 }
                });
            i.request
                .getProbe
                .withArgs('http_kbps')
                .returns({
                    'foo': { http_kbps: 60 },
                    'bar': { http_kbps: 85 },
                    'baz': { http_kbps: 90 }
                });
            i.request
                .getData
                .withArgs('fusion')
                .returns({
                    "foo": JSON.stringify({
                        "status": "HTTP server is functioning normally",
                        "state": "OK",
                        "health_score": {
                            "unit": "0-5",
                            "value": 5
                        },
                        "bypass_data_points": true
                    }),
                    "bar": JSON.stringify({
                        "status": "HTTP server is functioning normally",
                        "state": "OK",
                        "health_score": {
                            "unit": "0-5",
                            "value": 5
                        },
                        "bypass_data_points": true
                    }),
                    "baz": JSON.stringify({
                        "status": "HTTP server is functioning normally",
                        "state": "OK",
                        "health_score": {
                            "unit": "0-5",
                            "value": 5
                        },
                        "bypass_data_points": true
                    })
                });
            Math.random.returns(0.9);
            i.request.asn = 123;
            i.request.state = 'a';
            i.request.region = 'b';
            i.request.country = 'c';
            i.request.market = 'd1';
        },
        verify: function(i) {
            equal(i.request.getData.callCount, 1, 'Verifying getData call count');
            equal(i.response.respond.callCount, 1, 'Verifying respond call count');
            equal(i.response.setTTL.callCount, 1, 'Verifying setTTL call count');
            equal(i.response.setReasonCode.callCount, 1, 'Verifying setReasonCode call count');

            equal(i.response.respond.args[0][0], 'foo', 'Verifying respond provider');
            equal(i.response.respond.args[0][1], 'az.foo.net', 'Verifying respond CNAME');
            equal(i.response.setTTL.args[0][0], 20, 'Verifying setTTL');
            equal(i.response.setReasonCode.args[0][0], 'E,A', 'Verifying setReasonCode');
        }
    }));

    test('test 6 asn_override', test_handle_request({
        setup: function(i) {
            i.request
                .getProbe
                .withArgs('avail')
                .returns({
                    'foo': { avail: 100 },
                    'bar': { avail: 100 },
                    'baz': { avail: 100 }
                });
            i.request
                .getProbe
                .withArgs('http_rtt')
                .returns({
                    'foo': { http_rtt: 60 },
                    'bar': { http_rtt: 85 },
                    'baz': { http_rtt: 90 }
                });
            i.request
                .getProbe
                .withArgs('http_kbps')
                .returns({
                    'foo': { http_kbps: 60 },
                    'bar': { http_kbps: 85 },
                    'baz': { http_kbps: 90 }
                });
            i.request
                .getData
                .withArgs('fusion')
                .returns({
                    "foo": JSON.stringify({
                        "status": "HTTP server is functioning normally",
                        "state": "OK",
                        "health_score": {
                            "unit": "0-5",
                            "value": 5
                        },
                        "bypass_data_points": true
                    }),
                    "bar": JSON.stringify({
                        "status": "HTTP server is functioning normally",
                        "state": "OK",
                        "health_score": {
                            "unit": "0-5",
                            "value": 5
                        },
                        "bypass_data_points": true
                    }),
                    "baz": JSON.stringify({
                        "status": "HTTP server is functioning normally",
                        "state": "OK",
                        "health_score": {
                            "unit": "0-5",
                            "value": 5
                        },
                        "bypass_data_points": true
                    })
                });
            Math.random.returns(0.9);
            i.request.asn = 1234;
            i.request.state = 'a';
            i.request.region = 'b';
            i.request.country = 'c';
            i.request.market = 'd';
        },
        verify: function(i) {
            equal(i.request.getData.callCount, 1, 'Verifying getData call count');
            equal(i.response.respond.callCount, 1, 'Verifying respond call count');
            equal(i.response.setTTL.callCount, 1, 'Verifying setTTL call count');
            equal(i.response.setReasonCode.callCount, 1, 'Verifying setReasonCode call count');

            equal(i.response.respond.args[0][0], 'bar', 'Verifying respond provider');
            equal(i.response.respond.args[0][1], 'cn.bar.net', 'Verifying respond CNAME');
            equal(i.response.setTTL.args[0][0], 240, 'Verifying setTTL');
            equal(i.response.setReasonCode.args[0][0], 'F', 'Verifying setReasonCode');
        }
    }));

    test('test 7 all_providers_eliminated_radar', test_handle_request({
        setup: function(i) {
            i.request
                .getProbe
                .withArgs('avail')
                .returns({
                    'foo': { avail: 80 },
                    'bar': { avail: 80 },
                    'baz': { avail: 80 }
                });
            i.request
                .getProbe
                .withArgs('http_rtt')
                .returns({
                    'foo': { http_rtt: 60 },
                    'bar': { http_rtt: 85 },
                    'baz': { http_rtt: 90 }
                });
            i.request
                .getProbe
                .withArgs('http_kbps')
                .returns({
                    'foo': { http_kbps: 60 },
                    'bar': { http_kbps: 85 },
                    'baz': { http_kbps: 90 }
                });
            i.request
                .getData
                .withArgs('fusion')
                .returns({
                    "foo": JSON.stringify({
                        "status": "HTTP server is functioning normally",
                        "state": "OK",
                        "health_score": {
                            "unit": "0-5",
                            "value": 5
                        },
                        "bypass_data_points": true
                    }),
                    "bar": JSON.stringify({
                        "status": "HTTP server is functioning normally",
                        "state": "OK",
                        "health_score": {
                            "unit": "0-5",
                            "value": 5
                        },
                        "bypass_data_points": true
                    }),
                    "baz": JSON.stringify({
                        "status": "HTTP server is functioning normally",
                        "state": "OK",
                        "health_score": {
                            "unit": "0-5",
                            "value": 5
                        },
                        "bypass_data_points": true
                    })
                });
            Math.random.returns(0.9);
            i.request.asn = 123;
            i.request.state = 'a';
            i.request.region = 'b';
            i.request.country = 'c';
            i.request.market = 'd';
        },
        verify: function(i) {
            equal(i.request.getData.callCount, 1, 'Verifying getData call count');
            equal(i.response.respond.callCount, 1, 'Verifying respond call count');
            equal(i.response.setTTL.callCount, 1, 'Verifying setTTL call count');
            equal(i.response.setReasonCode.callCount, 1, 'Verifying setReasonCode call count');

            equal(i.response.respond.args[0][0], 'bar', 'Verifying respond provider');
            equal(i.response.respond.args[0][1], 'cn.bar.net', 'Verifying respond CNAME');
            equal(i.response.setTTL.args[0][0], 240, 'Verifying setTTL');
            equal(i.response.setReasonCode.args[0][0], 'I,G', 'Verifying setReasonCode');
        }
    }));

    test('test 8 all_providers_eliminated_sonar', test_handle_request({
        setup: function(i) {
            i.request
                .getProbe
                .withArgs('avail')
                .returns({
                    'foo': { avail: 100 },
                    'bar': { avail: 100 },
                    'baz': { avail: 100 }
                });
            i.request
                .getProbe
                .withArgs('http_rtt')
                .returns({
                    'foo': { http_rtt: 60 },
                    'bar': { http_rtt: 85 },
                    'baz': { http_rtt: 90 }
                });
            i.request
                .getProbe
                .withArgs('http_kbps')
                .returns({
                    'foo': { http_kbps: 60 },
                    'bar': { http_kbps: 85 },
                    'baz': { http_kbps: 90 }
                });
            i.request
                .getData
                .withArgs('fusion')
                .returns({
                    "foo": JSON.stringify({
                        "status": "HTTP server is functioning normally",
                        "state": "OK",
                        "health_score": {
                            "unit": "0-5",
                            "value": 0
                        },
                        "bypass_data_points": true
                    }),
                    "bar": JSON.stringify({
                        "status": "HTTP server is functioning normally",
                        "state": "OK",
                        "health_score": {
                            "unit": "0-5",
                            "value": 1
                        },
                        "bypass_data_points": true
                    }),
                    "baz": JSON.stringify({
                        "status": "HTTP server is functioning normally",
                        "state": "OK",
                        "health_score": {
                            "unit": "0-5",
                            "value": 0
                        },
                        "bypass_data_points": true
                    })
                });
            Math.random.returns(0.9);
            i.request.asn = 123;
            i.request.state = 'a';
            i.request.region = 'b';
            i.request.country = 'c';
            i.request.market = 'd';
        },
        verify: function(i) {
            equal(i.request.getData.callCount, 1, 'Verifying getData call count');
            equal(i.response.respond.callCount, 1, 'Verifying respond call count');
            equal(i.response.setTTL.callCount, 1, 'Verifying setTTL call count');
            equal(i.response.setReasonCode.callCount, 1, 'Verifying setReasonCode call count');

            equal(i.response.respond.args[0][0], 'bar', 'Verifying respond provider');
            equal(i.response.respond.args[0][1], 'cn.bar.net', 'Verifying respond CNAME');
            equal(i.response.setTTL.args[0][0], 240, 'Verifying setTTL');
            equal(i.response.setReasonCode.args[0][0], 'I,H', 'Verifying setReasonCode');
        }
    }));

    test('test 9 only_one_provider_avail', test_handle_request({
        setup: function(i) {
            i.request
                .getProbe
                .withArgs('avail')
                .returns({
                    'foo': { avail: 100 },
                    'bar': { avail: 100 },
                    'baz': { avail: 100 }
                });
            i.request
                .getProbe
                .withArgs('http_rtt')
                .returns({
                    'foo': { http_rtt: 60 },
                    'bar': { http_rtt: 85 },
                    'baz': { http_rtt: 90 }
                });
            i.request
                .getProbe
                .withArgs('http_kbps')
                .returns({
                    'foo': { http_kbps: 60 },
                    'bar': { http_kbps: 85 },
                    'baz': { http_kbps: 90 }
                });
            i.request
                .getData
                .withArgs('fusion')
                .returns({
                    "foo": JSON.stringify({
                        "status": "HTTP server is functioning normally",
                        "state": "OK",
                        "health_score": {
                            "unit": "0-5",
                            "value": 5
                        },
                        "bypass_data_points": true
                    }),
                    "bar": JSON.stringify({
                        "status": "HTTP server is functioning normally",
                        "state": "OK",
                        "health_score": {
                            "unit": "0-5",
                            "value": 1
                        },
                        "bypass_data_points": true
                    }),
                    "baz": JSON.stringify({
                        "status": "HTTP server is functioning normally",
                        "state": "OK",
                        "health_score": {
                            "unit": "0-5",
                            "value": 5
                        },
                        "bypass_data_points": true
                    })
                });
            Math.random.returns(0.9);
            i.request.asn = 123;
            i.request.state = 'a';
            i.request.region = 'b';
            i.request.country = 'c';
            i.request.market = 'd';
        },
        verify: function(i) {
            equal(i.request.getData.callCount, 1, 'Verifying getData call count');
            equal(i.response.respond.callCount, 1, 'Verifying respond call count');
            equal(i.response.setTTL.callCount, 1, 'Verifying setTTL call count');
            equal(i.response.setReasonCode.callCount, 1, 'Verifying setReasonCode call count');

            equal(i.response.respond.args[0][0], 'foo', 'Verifying respond provider');
            equal(i.response.respond.args[0][1], 'cn.foo.net', 'Verifying respond CNAME');
            equal(i.response.setTTL.args[0][0], 240, 'Verifying setTTL');
            equal(i.response.setReasonCode.args[0][0], 'I,J', 'Verifying setReasonCode');
        }
    }));

    test('test 10 data_problem', test_handle_request({
        setup: function(i) {
            i.request
                .getProbe
                .withArgs('avail')
                .returns({});
            i.request
                .getProbe
                .withArgs('http_rtt')
                .returns({
                    'foo': { http_rtt: 60 },
                    'bar': { http_rtt: 85 },
                    'baz': { http_rtt: 90 }
                });
            i.request
                .getProbe
                .withArgs('http_kbps')
                .returns({
                    'foo': { http_kbps: 60 },
                    'bar': { http_kbps: 85 },
                    'baz': { http_kbps: 90 }
                });
            i.request
                .getData
                .withArgs('fusion')
                .returns({
                    "foo": JSON.stringify({
                        "status": "HTTP server is functioning normally",
                        "state": "OK",
                        "health_score": {
                            "unit": "0-5",
                            "value": 5
                        },
                        "bypass_data_points": true
                    }),
                    "bar": JSON.stringify({
                        "status": "HTTP server is functioning normally",
                        "state": "OK",
                        "health_score": {
                            "unit": "0-5",
                            "value": 1
                        },
                        "bypass_data_points": true
                    }),
                    "baz": JSON.stringify({
                        "status": "HTTP server is functioning normally",
                        "state": "OK",
                        "health_score": {
                            "unit": "0-5",
                            "value": 5
                        },
                        "bypass_data_points": true
                    })
                });
            Math.random.returns(0.9);
            i.request.asn = 123;
            i.request.state = 'a';
            i.request.region = 'b';
            i.request.country = 'c';
            i.request.market = 'd';
        },
        verify: function(i) {
            equal(i.request.getData.callCount, 1, 'Verifying getData call count');
            equal(i.response.respond.callCount, 1, 'Verifying respond call count');
            equal(i.response.setTTL.callCount, 1, 'Verifying setTTL call count');
            equal(i.response.setReasonCode.callCount, 1, 'Verifying setReasonCode call count');

            equal(i.response.respond.args[0][0], 'foo', 'Verifying respond provider');
            equal(i.response.respond.args[0][1], 'cn.foo.net', 'Verifying respond CNAME');
            equal(i.response.setTTL.args[0][0], 240, 'Verifying setTTL');
            equal(i.response.setReasonCode.args[0][0], 'I,K', 'Verifying setReasonCode');
        }
    }));

    test('test 11 sonar_data_problem', test_handle_request({
        setup: function(i) {
            i.request
                .getProbe
                .withArgs('avail')
                .returns({
                    'foo': { avail: 100 },
                    'bar': { avail: 100 },
                    'baz': { avail: 100 }
                });
            i.request
                .getProbe
                .withArgs('http_rtt')
                .returns({
                    'foo': { http_rtt: 60 },
                    'bar': { http_rtt: 85 },
                    'baz': { http_rtt: 90 }
                });
            i.request
                .getProbe
                .withArgs('http_kbps')
                .returns({
                    'foo': { http_kbps: 60 },
                    'bar': { http_kbps: 85 },
                    'baz': { http_kbps: 90 }
                });
            i.request
                .getData
                .withArgs('fusion')
                .returns({
                    "foo": JSON.stringify({
                        "status": "HTTP server is functioning normally",
                        "state": "OK",
                        "health_score": {
                            "unit": "0-5",
                            "value": 5
                        },
                        "bypass_data_points": true,
                        "availability_override": true
                    }),
                    "bar": JSON.stringify({
                        "status": "HTTP server is functioning normally",
                        "state": "OK",
                        "health_score": {
                            "unit": "0-5",
                            "value": 5
                        },
                        "bypass_data_points": true,
                        "availability_override": true
                    }),
                    "baz": JSON.stringify({
                        "status": "HTTP server is functioning normally",
                        "state": "OK",
                        "health_score": {
                            "unit": "0-5",
                            "value": 5
                        },
                        "bypass_data_points": true,
                        "availability_override": true
                    })
                });
            Math.random.returns(0.9);
            i.request.asn = 123;
            i.request.state = 'a';
            i.request.region = 'b';
            i.request.country = 'c';
            i.request.market = 'd';
        },
        verify: function(i) {
            equal(i.request.getData.callCount, 1, 'Verifying getData call count');
            equal(i.response.respond.callCount, 1, 'Verifying respond call count');
            equal(i.response.setTTL.callCount, 1, 'Verifying setTTL call count');
            equal(i.response.setReasonCode.callCount, 1, 'Verifying setReasonCode call count');

            equal(i.response.respond.args[0][0], 'bar', 'Verifying respond provider');
            equal(i.response.respond.args[0][1], 'cn.bar.net', 'Verifying respond CNAME');
            equal(i.response.setTTL.args[0][0], 240, 'Verifying setTTL');
            equal(i.response.setReasonCode.args[0][0], 'I,L,A', 'Verifying setReasonCode');
        }
    }));

}());
