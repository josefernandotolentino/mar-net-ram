package com.example.helloworld;

import fi.iki.elonen.NanoHTTPD;

public class LocalHTTPD extends NanoHTTPD {

	static int PORTA=52123;
	
	public LocalHTTPD() {
		super(PORTA);
	}

}
