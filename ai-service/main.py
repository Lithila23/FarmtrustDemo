from fastapi import FastAPI
import pandas as pd
from prophet import Prophet

app = FastAPI()

@app.get("/predict/{product_name}")
def predict_price(product_name: str):

    # Load dataset
    df = pd.read_excel("data.xlsx")

    # Filter product
    product_df = df[df["Variety"] == product_name]

    # Rename columns
    product_df = product_df.rename(
        columns={
            "Date": "ds",
            "Price": "y"
        }
    )

    # Keep needed columns
    product_df = product_df[["ds", "y"]]

    # Convert date format
    product_df["ds"] = pd.to_datetime(product_df["ds"])

    # Remove negative or empty values
    product_df = product_df[product_df["y"] > 0]

    # Train model
    model = Prophet()
    model.fit(product_df)

    # Predict next day
    future = model.make_future_dataframe(periods=1)

    forecast = model.predict(future)

    predicted_price = forecast.iloc[-1]["yhat"]

    return {
        "product": product_name,
        "predicted_price": round(predicted_price, 2)
    }