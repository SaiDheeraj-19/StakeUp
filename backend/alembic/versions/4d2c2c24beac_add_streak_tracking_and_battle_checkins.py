"""Add streak tracking and battle checkins

Revision ID: 4d2c2c24beac
Revises: 2abd3c1cb07b
Create Date: 2026-07-10 00:09:14.242475

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4d2c2c24beac'
down_revision: Union[str, Sequence[str], None] = '2abd3c1cb07b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.batch_alter_table('check_ins') as batch_op:
        batch_op.add_column(sa.Column('battle_id', sa.UUID(), nullable=True))
        batch_op.alter_column('goal_id',
                   existing_type=sa.UUID(),
                   nullable=True)
        batch_op.create_index(batch_op.f('ix_check_ins_battle_id'), ['battle_id'], unique=False)
        batch_op.create_foreign_key('fk_check_ins_battles', 'battles', ['battle_id'], ['id'])
        
    with op.batch_alter_table('users') as batch_op:
        batch_op.add_column(sa.Column('highest_streak', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('last_checkin_date', sa.Date(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table('users') as batch_op:
        batch_op.drop_column('last_checkin_date')
        batch_op.drop_column('highest_streak')
        
    with op.batch_alter_table('check_ins') as batch_op:
        batch_op.drop_constraint('fk_check_ins_battles', type_='foreignkey')
        batch_op.drop_index(batch_op.f('ix_check_ins_battle_id'))
        batch_op.alter_column('goal_id',
                   existing_type=sa.UUID(),
                   nullable=False)
        batch_op.drop_column('battle_id')
