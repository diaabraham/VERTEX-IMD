import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import InfrastructureAsset
from channels.db import database_sync_to_async

class AssetUpdateConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add("asset_updates", self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("asset_updates", self.channel_name)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        await self.channel_layer.group_send(
            "asset_updates",
            {
                'type': 'asset_update',
                'message': message
            }
        )

    async def asset_update(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'message': message
        }))

    @database_sync_to_async
    def get_asset_updates(self):
        return list(InfrastructureAsset.objects.all().values('id', 'asset_id', 'status', 'estimated_condition'))