import pandas as pd
from prophet import Prophet

# Load Excel file
df = pd.read_excel("data.xlsx")

# Select only one product first
product_name = "Tomato"

product_df = df[df["Variety"] == product_name]

# Rename columns for Prophet
product_df = product_df.rename(
    columns={
        "Date": "ds",
        "Price": "y"
    }
)

# Keep only required columns
product_df = product_df[["ds", "y"]]

# Convert date column
product_df["ds"] = pd.to_datetime(product_df["ds"])

# Create model
model = Prophet()

# Train model
model.fit(product_df)

# Create future dates
future = model.make_future_dataframe(periods=7)

# Predict
forecast = model.predict(future)

# Show predictions
print(forecast[["ds", "yhat"]].tail())