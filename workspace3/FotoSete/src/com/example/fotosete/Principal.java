package com.example.fotosete;

import java.io.IOException;

import android.app.Activity;
import android.hardware.Camera;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;
import android.view.SurfaceHolder;
import android.view.SurfaceView;

public class Principal extends Activity implements SurfaceHolder.Callback {


	
	private Camera filmadoraCamera;
	private SurfaceView filmadoraView;
	
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_principal);
		filmadoraCamera = Camera.open();
		filmadoraView = (SurfaceView) findViewById(R.id.filmadora);
		filmadoraView.getHolder().addCallback(this);
	}

	@Override
	protected void onDestroy() {
		super.onDestroy();

		if (filmadoraCamera != null) {
			filmadoraCamera.release();
		}
	}
	@Override
	public void surfaceCreated(SurfaceHolder holder) {
		System.out.println("CREATE-SURFACE");
		try {
			filmadoraCamera.setPreviewDisplay(holder);
			filmadoraCamera.startPreview();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	@Override
	public void surfaceChanged(SurfaceHolder holder,  int format, int width, int height) {
		System.out.println("ZERO");
		if (holder.getSurface() != null) {
			try {
				filmadoraCamera.stopPreview();
			} catch (Exception e) {
			}

			try {
				System.out.println("UM");
				filmadoraCamera.setPreviewDisplay(holder);
				System.out.println("DOIS");
				filmadoraCamera.startPreview();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
	}

	@Override
	public void surfaceDestroyed(SurfaceHolder arg0) {
		super.onDestroy();

	}
	
	@Override
	protected void onPause() {
		super.onPause();
		if (filmadoraCamera != null) {
			filmadoraCamera.stopPreview();
		}
	}
}
