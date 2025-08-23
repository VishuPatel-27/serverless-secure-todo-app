# Build rule for MyFunction
build-CreateTodoFunction:
	# Clean the artifact directory
	rm -rf $(ARTIFACTS_DIR)/*
	
	# Copy only package.json + lock file
	cp package.json package-lock.json $(ARTIFACTS_DIR)/
	
	# Install production dependencies inside the artifact folder
	cd $(ARTIFACTS_DIR) && npm install --omit=dev
	
	# Copy Lambda source code (everything from src/) into the artifact folder
	cp -r src/ $(ARTIFACTS_DIR)/

build-GetTodosFunction:
	# Clean the artifact directory
	rm -rf $(ARTIFACTS_DIR)/*
	
	# Copy only package.json + lock file
	cp package.json package-lock.json $(ARTIFACTS_DIR)/
	
	# Install production dependencies inside the artifact folder
	cd $(ARTIFACTS_DIR) && npm install --omit=dev
	
	# Copy Lambda source code (everything from src/) into the artifact folder
	cp -r src/ $(ARTIFACTS_DIR)/

build-UpdateTodoFunction:
	# Clean the artifact directory
	rm -rf $(ARTIFACTS_DIR)/*
	
	# Copy only package.json + lock file
	cp package.json package-lock.json $(ARTIFACTS_DIR)/
	
	# Install production dependencies inside the artifact folder
	cd $(ARTIFACTS_DIR) && npm install --omit=dev
	
	# Copy Lambda source code (everything from src/) into the artifact folder
	cp -r src/ $(ARTIFACTS_DIR)/

build-DeleteTodoFunction:
	# Clean the artifact directory
	rm -rf $(ARTIFACTS_DIR)/*
	
	# Copy only package.json + lock file
	cp package.json package-lock.json $(ARTIFACTS_DIR)/
	
	# Install production dependencies inside the artifact folder
	cd $(ARTIFACTS_DIR) && npm install --omit=dev
	
	# Copy Lambda source code (everything from src/) into the artifact folder
	cp -r src/ $(ARTIFACTS_DIR)/